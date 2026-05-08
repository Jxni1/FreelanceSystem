using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Common
{
    public interface IAppDbContext
    {
        DbSet<User> Users { get; }
        DbSet<Role> Roles { get; }
        DbSet<Permission> Permissions { get; }
        DbSet<UserRole> UserRoles { get; }
        DbSet<RolePermission> RolePermissions { get; }
        DbSet<RefreshToken> RefreshTokens { get; }

        DbSet<FreelancerProfile> FreelancerProfiles { get; }
        DbSet<ClientProfile> ClientProfiles { get; }

        DbSet<Project> Projects { get; }
        DbSet<Category> Categories { get; }
        DbSet<Proposal> Proposals { get; }
        DbSet<ProjectSkills> ProjectSkills { get; }
        DbSet<FreelancerSkills> FreelancerSkills { get; }
        DbSet<SavedProjects> SavedProjects { get; }
        DbSet<Skills> Skills { get; }

        DbSet<Contract> Contracts { get; }
        DbSet<Milestone> Milestones { get; }
        DbSet<Payment> Payments { get; }
        DbSet<Transactions> Transactions { get; }
        DbSet<Deliverables> Deliverables { get; }

        DbSet<Review> Reviews { get; }
        DbSet<Files> Files { get; }
        DbSet<Favorite_Freelancer> Favorite_Freelancers { get; }
        DbSet<Protected_Views> Protected_Views { get; }  
        DbSet<Report> Reports { get; }
        DbSet<Audit_Logs> Audit_Logs { get; }
        DbSet<Notification> Notifications { get; }
        DbSet<Setting> Settings { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}