using LabCourse2.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;

namespace LabCourse2.Infrastructure.Services
{
    public class RedisRefreshTokenStore : IRefreshTokenStore
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<RedisRefreshTokenStore> _logger;
        private readonly string _instanceName;

        private static readonly TimeSpan FamilyTombstoneTtl = TimeSpan.FromDays(8);

        public RedisRefreshTokenStore(
            IConnectionMultiplexer redis,
            ILogger<RedisRefreshTokenStore> logger,
            IConfiguration configuration)
        {
            _redis = redis;
            _logger = logger;
            _instanceName = configuration["Redis:InstanceName"] ?? string.Empty;
        }

        private string TokenKey(string tokenHash) => $"{_instanceName}refresh_token_{tokenHash}";
        private string FamilyKey(Guid familyId) => $"{_instanceName}refresh_family_revoked_{familyId}";

        public async Task StoreAsync(RefreshTokenData token)
        {
            var ttl = token.ExpiresAt - DateTime.UtcNow;
            if (ttl <= TimeSpan.Zero)
                return;

            var db = _redis.GetDatabase();
            await db.StringSetAsync(TokenKey(token.TokenHash), JsonSerializer.Serialize(token), ttl);
        }

        public async Task<RefreshTokenData?> GetAsync(string tokenHash)
        {
            var db = _redis.GetDatabase();
            var value = await db.StringGetAsync(TokenKey(tokenHash));

            if (!value.HasValue)
                return null;

            try
            {
                return JsonSerializer.Deserialize<RefreshTokenData>((string)value!);
            }
            catch (Exception ex)
            {
                _logger.LogError($"[REFRESH] Failed to deserialize token {tokenHash}: {ex.Message}");
                return null;
            }
        }

        public async Task UpdateAsync(RefreshTokenData token)
        {
            var ttl = token.ExpiresAt - DateTime.UtcNow;
            if (ttl <= TimeSpan.Zero)
                ttl = TimeSpan.FromMinutes(1);

            var db = _redis.GetDatabase();
            await db.StringSetAsync(TokenKey(token.TokenHash), JsonSerializer.Serialize(token), ttl);
        }

        public async Task RevokeFamilyAsync(Guid familyId)
        {
            var db = _redis.GetDatabase();
            await db.StringSetAsync(FamilyKey(familyId), "1", FamilyTombstoneTtl);
        }

        public async Task<bool> IsFamilyRevokedAsync(Guid familyId)
        {
            var db = _redis.GetDatabase();
            return await db.KeyExistsAsync(FamilyKey(familyId));
        }
    }
}
