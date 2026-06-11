namespace LabCourse2.Application.Interfaces
{
    public class RefreshTokenData
    {
        public Guid TokenId { get; set; }
        public string TokenHash { get; set; } = null!;
        public Guid UserId { get; set; }
        public Guid FamilyId { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public Guid? ReplacedByTokenId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? UserAgent { get; set; }
        public string? CreatedFromIp { get; set; }

        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsRevoked => RevokedAt != null;
        public bool IsConsumed => ReplacedByTokenId != null;
        public bool IsActive => !IsRevoked && !IsExpired && !IsConsumed;
    }

    public interface IRefreshTokenStore
    {
        Task StoreAsync(RefreshTokenData token);
        Task<RefreshTokenData?> GetAsync(string tokenHash);
        Task UpdateAsync(RefreshTokenData token);
        Task RevokeFamilyAsync(Guid familyId);
        Task<bool> IsFamilyRevokedAsync(Guid familyId);
    }
}
