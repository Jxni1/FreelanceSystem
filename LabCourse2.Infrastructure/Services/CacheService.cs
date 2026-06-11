using LabCourse2.Application.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;
using System.Threading;

namespace LabCourse2.Infrastructure.Services;

public class CacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<CacheService> _logger;
    private readonly IConnectionMultiplexer _connectionMultiplexer;
    private readonly string _instanceName;

    public CacheService(IDistributedCache cache, ILogger<CacheService> logger, IConnectionMultiplexer connectionMultiplexer, IConfiguration configuration)
    {
        _cache = cache;
        _logger = logger;
        _connectionMultiplexer = connectionMultiplexer;
        _instanceName = configuration["Redis:InstanceName"] ?? string.Empty;
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

    public async Task ClearAllAsync()
    {
        try
        {
            _logger.LogInformation("[CACHE] ClearAllAsync called - Redis cache can only be cleared directly via Redis CLI");
        }
        catch (Exception ex)
        {
            _logger.LogError($"[CACHE] Failed to clear cache: {ex.Message}");
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
            _logger.LogInformation($"[CACHE] REMOVE: {key}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"[CACHE] REMOVE ERROR: {key} - {ex.Message}");
        }
    }

    public async Task RemoveByPatternAsync(string pattern)
    {
        try
        {
            var endpoints = _connectionMultiplexer.GetEndPoints();
            if (endpoints.Length == 0)
            {
                _logger.LogWarning($"[CACHE] PATTERN REMOVE: {pattern} - No Redis endpoints available");
                return;
            }
            

            var tasks = new List<Task>();
            int totalKeysRemoved = 0;
            var db = _connectionMultiplexer.GetDatabase();
            var prefixedPattern = $"{_instanceName}{pattern}";

            foreach (var endpoint in endpoints)
            {
                var server = _connectionMultiplexer.GetServer(endpoint);
                
                // Use SCAN to find keys matching the pattern (with instance prefix)
                var keys = server.Keys(pattern: prefixedPattern);
                
                foreach (var key in keys)
                {
                    tasks.Add(db.KeyDeleteAsync(key));
                    totalKeysRemoved++;
                }
            }

            if (tasks.Count > 0)
            {
                await Task.WhenAll(tasks);
                _logger.LogInformation($"[CACHE] PATTERN REMOVE: {pattern} - Successfully removed {totalKeysRemoved} keys");
            }
            else
            {
                _logger.LogInformation($"[CACHE] PATTERN REMOVE: {pattern} - No matching keys found");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"[CACHE] PATTERN REMOVE ERROR: {pattern} - {ex.Message}");
        }
    }

    private const string IncrementIfExistsScript =
        "if redis.call('EXISTS', KEYS[1]) == 1 then return redis.call('INCRBY', KEYS[1], ARGV[1]) else return -1 end";

    public async Task<long?> GetCounterAsync(string key)
    {
        try
        {
            var db = _connectionMultiplexer.GetDatabase();
            var value = await db.StringGetAsync($"{_instanceName}{key}");

            if (value.HasValue && long.TryParse((string?)value, out var parsed))
            {
                _logger.LogInformation($"[CACHE] COUNTER HIT: {key} = {parsed}");
                return parsed;
            }

            _logger.LogInformation($"[CACHE] COUNTER MISS: {key}");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"[CACHE] COUNTER GET ERROR: {key} - {ex.Message}");
            return null;
        }
    }

    public async Task SetCounterAsync(string key, long value, TimeSpan? expiration = null)
    {
        try
        {
            var db = _connectionMultiplexer.GetDatabase();
            await db.StringSetAsync($"{_instanceName}{key}", value, expiration ?? TimeSpan.FromHours(1));
            _logger.LogInformation($"[CACHE] COUNTER SET: {key} = {value}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"[CACHE] COUNTER SET ERROR: {key} - {ex.Message}");
        }
    }

    public async Task AdjustCounterIfExistsAsync(string key, long delta)
    {
        try
        {
            var db = _connectionMultiplexer.GetDatabase();
            await db.ScriptEvaluateAsync(
                IncrementIfExistsScript,
                new RedisKey[] { $"{_instanceName}{key}" },
                new RedisValue[] { delta });
            _logger.LogInformation($"[CACHE] COUNTER ADJUST: {key} by {delta}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"[CACHE] COUNTER ADJUST ERROR: {key} - {ex.Message}");
        }
    }
}