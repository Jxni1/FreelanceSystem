namespace LabCourse2.Application.Interfaces;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);
    Task RemoveAsync(string key);
    Task RemoveByPatternAsync(string pattern);

    Task<long?> GetCounterAsync(string key);
    Task SetCounterAsync(string key, long value, TimeSpan? expiration = null);
    Task AdjustCounterIfExistsAsync(string key, long delta);
}