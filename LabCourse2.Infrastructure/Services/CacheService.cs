using LabCourse2.Application.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Threading;

namespace LabCourse2.Infrastructure.Services;

public class CacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<CacheService> _logger;

    public CacheService(IDistributedCache cache, ILogger<CacheService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        try
        {
            var cached = await _cache.GetStringAsync(key);
            if (cached == null)
            {
                _logger.LogInformation($"Cache MISS: {key}");
                return default;
            }
            
            _logger.LogInformation($"Cache HIT: {key} - Size: {cached.Length} bytes");
            return JsonSerializer.Deserialize<T>(cached);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Cache GET ERROR: {key} - {ex.Message}");
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        try
        {
            if (value == null)
            {
                _logger.LogWarning($"Cache SET attempted with null value for key: {key}");
                return;
            }

            var serialized = JsonSerializer.Serialize(value);
            _logger.LogInformation($"[CACHE] SET START: {key} | Size: {serialized.Length} bytes");
            
            var options = new DistributedCacheEntryOptions();
            
            if (expiration.HasValue)
            {
                options.AbsoluteExpirationRelativeToNow = expiration;
                _logger.LogInformation($"[CACHE] SET with TTL: {expiration.Value.TotalSeconds} seconds");
            }
            else
            {
                options.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
                _logger.LogInformation($"[CACHE] SET with default TTL: 1 hour");
            }

            // Use a timeout to prevent hanging
            using (var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5)))
            {
                await _cache.SetStringAsync(key, serialized, options, cts.Token);
            }

            _logger.LogInformation($"[CACHE] SET SUCCESS: {key}");
        }
        catch (OperationCanceledException)
        {
            _logger.LogError($"[CACHE] SET TIMEOUT: {key} - Redis took too long to respond");
        }
        catch (Exception ex)
        {
            _logger.LogError($"[CACHE] SET ERROR: {key} | Exception: {ex.GetType().Name} | Message: {ex.Message}");
        }
    }

    public async Task RemoveAsync(string key)
    {
        try
        {
            await _cache.RemoveAsync(key);
        }
        catch
        {
            
        }
    }

    public async Task RemoveByPatternAsync(string pattern)
    {
        
        await Task.CompletedTask;
    }
}