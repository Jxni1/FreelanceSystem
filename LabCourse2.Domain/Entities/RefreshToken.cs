using System;
using System.Collections.Generic;
using System.Text;

namespace LabCourse2.Domain.Entities
{
    public class RefreshToken
    {
        public Guid TokenID { get; set; }
        public string Token_Hash { get; set; } = null!;
        public DateTime Expires_At { get; set; }
        public DateTime? Revoked_At { get; set; }
        public DateTime Created_At { get; set; } = DateTime.UtcNow;

        public Guid UserID { get; set; }
        public User User { get; set; } = null!;

        public bool IsExpired => DateTime.UtcNow >= Expires_At;
        public bool IsRevoked => Revoked_At != null;
        public bool IsActive => !IsRevoked && !IsExpired;
    }

}
