using LabCourse2.Domain.Entities;
using LabCourse2.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Infrastructure.Persistence
{
    public class AppDbContext : DbContext, IAppDbContext {

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<FreelancerProfile> FreelancerProfiles => Set<FreelancerProfile>();
        public DbSet<ClientProfile> ClientProfiles => Set<ClientProfile>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
        public DbSet<Protected_Views> Protected_Views => Set<Protected_Views>();
        public DbSet<Contract> Contracts => Set<Contract>();
        public DbSet<Milestone> Milestones => Set<Milestone>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<Files> Files => Set<Files>();
        public DbSet<Favorite_Freelancer> Favorite_Freelancers => Set<Favorite_Freelancer>();
        public DbSet<Deliverables> Deliverables => Set<Deliverables>();
        public DbSet<Report> Reports => Set<Report>();
        public DbSet<Audit_Logs> Audit_Logs => Set<Audit_Logs>();
        public DbSet<Skills> Skills => Set<Skills>();
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Setting> Settings { get; set; }
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<Proposal> Proposals => Set<Proposal>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<ProjectSkills> ProjectSkills => Set<ProjectSkills>();

        public DbSet<FreelancerSkills> FreelancerSkills => Set<FreelancerSkills>();
        public DbSet<SavedProjects> SavedProjects => Set<SavedProjects>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Transactions> Transactions => Set<Transactions>();
        public DbSet<ProcessedStripeEvent> ProcessedStripeEvents => Set<ProcessedStripeEvent>();
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Message> Messages { get; set; }

        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>(e => e.HasKey(r => r.RoleID));
            modelBuilder.Entity<Permission>(e => e.HasKey(p => p.PermissionsID));
            modelBuilder.Entity<User>(e =>
            {
                e.HasKey(u => u.UserID);
                e.HasIndex(u => u.Email).IsUnique();
                e.HasIndex(u => u.Username).IsUnique();
                e.HasQueryFilter(u => !u.Is_Deleted);
            });
            modelBuilder.Entity<Conversation>(entity =>
            {
                entity.HasKey(e => e.ConversationID);

                entity.Property(e => e.Status)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.HasOne(e => e.Contract)
                    .WithMany()
                    .HasForeignKey(e => e.ContractID)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Client)
                    .WithMany(c => c.Conversations)
                    .HasForeignKey(e => e.ClientID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Freelancer)
                    .WithMany(f => f.Conversations)
                    .HasForeignKey(e => e.FreelancerID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Created_by).HasMaxLength(100);
                entity.Property(e => e.Updated_by).HasMaxLength(100);
            });
            modelBuilder.Entity<Message>(entity =>
            {
                entity.HasKey(e => e.MessageID);

                entity.HasOne(e => e.Conversation)
                    .WithMany(c => c.Messages)
                    .HasForeignKey(e => e.ConversationID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.SenderUser)
                    .WithMany(u => u.MessagesSent)
                    .HasForeignKey(e => e.SenderUserID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Content)
                    .HasMaxLength(2000)
                    .IsRequired();

                entity.Property(e => e.Created_by).HasMaxLength(100);
                entity.Property(e => e.Updated_by).HasMaxLength(100);
            });

            modelBuilder.Entity<FreelancerProfile>(e =>
            {
                e.HasKey(f => f.FreelancerID);
                e.HasOne(f => f.User)
                 .WithOne(u => u.FreelancerProfile)
                 .HasForeignKey<FreelancerProfile>(f => f.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
                e.Property(f => f.StripeAccountId).HasMaxLength(255);
                e.Property(f => f.StripePayoutsEnabled).HasDefaultValue(false);
            });

            modelBuilder.Entity<ClientProfile>(e =>
            {
                e.HasKey(c => c.ClientID);
                e.HasOne(c => c.User)
                 .WithOne(u => u.ClientProfile)
                 .HasForeignKey<ClientProfile>(c => c.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ========================
            // RBAC Configuration with Seeding
            // ========================

            // Fixed GUIDs for seeding consistency
            var adminRoleId = new Guid("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
            var clientRoleId = new Guid("b2c3d4e5-f6a7-4b5c-8d9e-1f2a3b4c5d6e");
            var freelancerRoleId = new Guid("c3d4e5f6-a7b8-4c5d-8e9f-2a3b4c5d6e7f");

            var projectsCreatePermissionId = new Guid("d4e5f6a7-b8c9-4d5e-8f9a-3b4c5d6e7f8a");
            var projectsDeletePermissionId = new Guid("e5f6a7b8-c9da-4e5f-8a9b-4c5d6e7f8a9b");
            var proposalsSubmitPermissionId = new Guid("f6a7b8c9-daeb-4f5a-8b9c-5d6e7f8a9b0c");
            var usersBlockPermissionId = new Guid("a7b8c9da-ebfc-4a5b-8c9d-6e7f8a9b0c1d");

            // Configure UserRole: Many-to-Many between User and Role
            modelBuilder.Entity<UserRole>(e =>
            {
                e.HasKey(ur => ur.UserRolesID);
                e.HasOne(ur => ur.User)
                 .WithMany(u => u.UserRoles)
                 .HasForeignKey(ur => ur.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(ur => ur.Role)
                 .WithMany(r => r.UserRoles)
                 .HasForeignKey(ur => ur.RoleID)
                 .OnDelete(DeleteBehavior.Cascade);
                // Prevent duplicate role assignments
                e.HasIndex(ur => new { ur.UserID, ur.RoleID }).IsUnique();
            });

            // Configure RolePermission: Many-to-Many between Role and Permission
            modelBuilder.Entity<RolePermission>(e =>
            {
                e.HasKey(rp => rp.RolePermissionsID);
                e.HasOne(rp => rp.Role)
                 .WithMany(r => r.RolePermissions)
                 .HasForeignKey(rp => rp.RoleID)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(rp => rp.Permission)
                 .WithMany(p => p.RolePermissions)
                 .HasForeignKey(rp => rp.PermissionsID)
                 .OnDelete(DeleteBehavior.Cascade);
                // Prevent duplicate permission assignments
                e.HasIndex(rp => new { rp.RoleID, rp.PermissionsID }).IsUnique();
            });

            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role
                {
                    RoleID = adminRoleId,
                    Name = "Admin",
                    Description = "Administrator role with full system access and management capabilities",
                    Created_At = new DateTime(2025, 4, 23, 12, 0, 0, DateTimeKind.Utc)
                },
                new Role
                {
                    RoleID = clientRoleId,
                    Name = "Client",
                    Description = "Role for project owners who create projects and hire freelancers",
                    Created_At = new DateTime(2025, 4, 23, 12, 0, 0, DateTimeKind.Utc)
                },
                new Role
                {
                    RoleID = freelancerRoleId,
                    Name = "Freelancer",
                    Description = "Role for independent service providers who submit proposals and complete projects",
                    Created_At = new DateTime(2025, 4, 23, 12, 0, 0, DateTimeKind.Utc)
                }
            );

            // Seed Permissions
            modelBuilder.Entity<Permission>().HasData(
                new Permission
                {
                    PermissionsID = projectsCreatePermissionId,
                    Name = "projects.create",
                    Description = "Permission to create and post new projects"
                },
                new Permission
                {
                    PermissionsID = projectsDeletePermissionId,
                    Name = "projects.delete",
                    Description = "Permission to delete projects"
                },
                new Permission
                {
                    PermissionsID = proposalsSubmitPermissionId,
                    Name = "proposals.submit",
                    Description = "Permission to submit proposals for projects"
                },
                new Permission
                {
                    PermissionsID = usersBlockPermissionId,
                    Name = "users.block",
                    Description = "Permission to block or suspend user accounts"
                }
            );

            // Seed RolePermissions: Map permissions to roles
            modelBuilder.Entity<RolePermission>().HasData(
                // Admin: ALL permissions
                new RolePermission
                {
                    RolePermissionsID = new Guid("d1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a"),
                    RoleID = adminRoleId,
                    PermissionsID = projectsCreatePermissionId,
                    Created_At = new DateTime(2025, 4, 23, 12, 0, 0, DateTimeKind.Utc)
                },
                new RolePermission
                {
                    RolePermissionsID = new Guid("e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b"),
                    RoleID = adminRoleId,
                    PermissionsID = projectsDeletePermissionId,
                    Created_At = new DateTime(2025, 4, 23, 12, 0, 0, DateTimeKind.Utc)
                },
                new RolePermission
                {
                    RolePermissionsID = new Guid("f3a4b5c6-d7e8-4f9a-0b1c-2d3e4f5a6b7c"),
                    RoleID = adminRoleId,
                    PermissionsID = proposalsSubmitPermissionId,
                    Created_At = new DateTime(2025, 4, 23, 12, 0, 0, DateTimeKind.Utc)
                },
                new RolePermission
                {
                    RolePermissionsID = new Guid("a4b5c6d7-e8f9-4a0b-1c2d-3e4f5a6b7c8d"),
                    RoleID = adminRoleId,
                    PermissionsID = usersBlockPermissionId,
                    Created_At = new DateTime(2025, 4, 23, 12, 0, 0, DateTimeKind.Utc)
                },
                // Client: projects.create only
                new RolePermission
                {
                    RolePermissionsID = new Guid("b5c6d7e8-f9a0-4b1c-2d3e-4f5a6b7c8d9e"),
                    RoleID = clientRoleId,
                    PermissionsID = projectsCreatePermissionId,
                    Created_At = new DateTime(2025, 4, 23, 12, 0, 0, DateTimeKind.Utc)
                },
                // Freelancer: proposals.submit only
                new RolePermission
                {
                    RolePermissionsID = new Guid("c6d7e8f9-a0b1-4c2d-3e4f-5a6b7c8d9e0f"),
                    RoleID = freelancerRoleId,
                    PermissionsID = proposalsSubmitPermissionId,
                    Created_At = new DateTime(2025, 4, 23, 12, 0, 0, DateTimeKind.Utc)
                }
            );

            modelBuilder.Entity<RefreshToken>(e =>
            {
                e.HasKey(r => r.TokenID);
                e.HasOne(r => r.User)
                 .WithMany(u => u.RefreshTokens)
                 .HasForeignKey(r => r.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Category>(e => e.HasKey(c => c.CategoryID));
            modelBuilder.Entity<Skills>(e => e.HasKey(s => s.SkillsID));

            modelBuilder.Entity<Project>(e =>
            {
                e.HasKey(p => p.ProjectID);
                e.HasOne(p => p.Client)
                 .WithMany()
                 .HasForeignKey(p => p.ClientID)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(p => p.Category)
                 .WithMany()
                 .HasForeignKey(p => p.CategoryID)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Proposal>(e =>
            {
                e.HasKey(p => p.ProposalId);
                e.HasOne(p => p.Freelancer)
                 .WithMany()
                 .HasForeignKey(p => p.FreelancerId)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(p => p.Project)
                 .WithMany()
                 .HasForeignKey(p => p.ProjectId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ProjectSkills>(e =>
            {
                e.HasKey(ps => ps.ProjectSkillsID);
                e.HasOne(ps => ps.Project)
                 .WithMany()
                 .HasForeignKey(ps => ps.ProjectID)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(ps => ps.Skill)
                 .WithMany()
                 .HasForeignKey(ps => ps.SkillID)
                 .OnDelete(DeleteBehavior.Cascade);
            });


            modelBuilder.Entity<FreelancerSkills>(e =>
            {
                e.HasKey(fs => fs.FreelancerSkillsID);
                e.HasOne(fs => fs.Freelancer)
                 .WithMany()
                 .HasForeignKey(fs => fs.FreelancerID)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(fs => fs.Skill)
                 .WithMany()
                 .HasForeignKey(fs => fs.SkillID)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<SavedProjects>(e =>
            {
                e.HasKey(sp => sp.SavedProjectID);
                e.HasOne(sp => sp.User)
                 .WithMany()
                 .HasForeignKey(sp => sp.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(sp => sp.Project)
                 .WithMany()
                 .HasForeignKey(sp => sp.ProjectID)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Contract>(e =>
            {
                e.HasKey(c => c.ContractID);
                e.HasOne(c => c.Proposal)
                 .WithMany()
                 .HasForeignKey(c => c.ProposalID)
                 .OnDelete(DeleteBehavior.Restrict);
                e.HasOne(c => c.Client)
                 .WithMany(cp => cp.Contracts)
                 .HasForeignKey(c => c.ClientID)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(c => c.Freelancer)
                 .WithMany(fp => fp.Contracts)
                 .HasForeignKey(c => c.FreelancerID)
                 .OnDelete(DeleteBehavior.Restrict);
                e.HasOne(c => c.Project)
                 .WithMany(p => p.Contracts)
                 .HasForeignKey(c => c.ProjectID)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Milestone>(e =>
            {
                e.HasKey(m => m.MilestoneID);
                e.HasOne(m => m.Contract)
                 .WithMany(c => c.Milestones)
                 .HasForeignKey(m => m.ContractID)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Payment>(e =>
            {
                e.HasKey(p => p.PaymentID);
                e.Property(p => p.Payment_method).IsRequired().HasMaxLength(50);
                e.Property(p => p.Status).IsRequired().HasMaxLength(20);
                e.Property(p => p.Amount).IsRequired().HasPrecision(18, 2);
                e.Property(p => p.Currency).HasMaxLength(10);
                e.Property(p => p.StripePaymentIntentId).HasMaxLength(255);
                e.Property(p => p.StripeCheckoutSessionId).HasMaxLength(255);
                e.Property(p => p.StripeChargeId).HasMaxLength(255);
                e.Property(p => p.StripeTransferId).HasMaxLength(255);
                e.Property(p => p.StripeRefundId).HasMaxLength(255);
                e.HasOne<Contract>()
                 .WithMany(c => c.Payment)
                 .HasForeignKey(p => p.ContractID)
                 .OnDelete(DeleteBehavior.Restrict);
                e.HasOne(p => p.Milestone)
                 .WithMany()
                 .HasForeignKey(p => p.MilestoneID)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Transactions>(e =>
            {
                e.HasKey(t => t.TransactionsID);
                e.HasIndex(t => t.Reference).IsUnique();
                e.HasIndex(t => t.PaymentID);
                e.HasIndex(t => t.MilestoneID);
                e.Property(t => t.Status).IsRequired().HasMaxLength(20);
                e.Property(t => t.Reference).IsRequired().HasMaxLength(100);
                e.Property(t => t.Type).IsRequired().HasMaxLength(20);
                e.Property(t => t.Amount).IsRequired().HasPrecision(18, 2);
                e.ToTable(t => t.HasCheckConstraint("CK_Transactions_Type",
                    "[Type] IN ('deposit','release','refund')"));
                e.HasOne(t => t.Payment)
                 .WithMany(p => p.Transactions)
                 .HasForeignKey(t => t.PaymentID)
                 .OnDelete(DeleteBehavior.Restrict);
                e.HasOne(t => t.Milestone)
                 .WithMany(m => m.Transactions)
                 .HasForeignKey(t => t.MilestoneID)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ProcessedStripeEvent>(e =>
            {
                e.HasKey(p => p.EventId);
                e.Property(p => p.EventId).HasMaxLength(255);
                e.Property(p => p.Type).IsRequired().HasMaxLength(100);
            });

            modelBuilder.Entity<Review>(e =>
            {
                e.HasKey(r => r.ReviewsID);
                e.HasOne(r => r.Contract)
                 .WithMany(c => c.Reviews)
                 .HasForeignKey(r => r.ContractID)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(r => r.Freelancer)
                 .WithMany(f => f.Reviews)
                 .HasForeignKey(r => r.FreelancerID)
                 .OnDelete(DeleteBehavior.Restrict);
                e.HasOne(r => r.Client)
                 .WithMany(c => c.Reviews)
                 .HasForeignKey(r => r.ClientID)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Deliverables>(e =>
            {
                e.HasKey(d => d.DeliverablesID);
                e.HasOne(d => d.Milestone)
                 .WithMany(m => m.Deliverables)
                 .HasForeignKey(d => d.MilestoneID)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(d => d.File)
                 .WithMany()
                 .HasForeignKey(d => d.FileID)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Files>(e => e.HasKey(f => f.FilesID));
            modelBuilder.Entity<Favorite_Freelancer>(e =>
            {
                e.HasKey(ff => ff.Favorite_FreelancerID);

                e.HasOne(ff => ff.Client)
                 .WithMany(c => c.FavoriteFreelancers)
                 .HasForeignKey(ff => ff.ClientID)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(ff => ff.Freelancer)
                 .WithMany(f => f.FavoriteFreelancers)
                 .HasForeignKey(ff => ff.FreelancerID)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(ff => new { ff.ClientID, ff.FreelancerID }).IsUnique();
            });

            modelBuilder.Entity<Report>(e =>
            {
                e.HasKey(r => r.ReportsID);
                e.HasOne(r => r.User)
                 .WithMany(u => u.Reports)
                 .HasForeignKey(r => r.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Audit_Logs>(e =>
            {
                e.HasKey(al => al.Audit_LogsID);
                e.HasOne(al => al.User)
                 .WithMany(u => u.AuditLogs)
                 .HasForeignKey(al => al.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Notification>(e =>
            {
                e.HasKey(n => n.NotificationID);
                e.HasOne(n => n.User)
                 .WithMany(u => u.Notifications)
                 .HasForeignKey(n => n.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Setting>(e => e.HasKey(s => s.SettingID));

            modelBuilder.Entity<Protected_Views>(e =>
            {
                e.HasKey(pv => pv.Protected_ViewsID);
                e.HasOne(pv => pv.User)
                 .WithMany(u => u.ProtectedViews)
                 .HasForeignKey(pv => pv.UserID)
                 .OnDelete(DeleteBehavior.Restrict);
                e.HasOne(pv => pv.Project)
                 .WithMany(p => p.ProtetectedViews)
                 .HasForeignKey(pv => pv.ProjectID)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<FreelancerProfile>().Property(f => f.Hourly_Rate).HasPrecision(18, 2);
            modelBuilder.Entity<ClientProfile>().Property(c => c.Budget).HasPrecision(18, 2);
            modelBuilder.Entity<Project>().Property(p => p.Budget).HasPrecision(18, 2);
            modelBuilder.Entity<Proposal>().Property(p => p.BidAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Contract>().Property(c => c.Agreed_Price).HasPrecision(18, 2);
        }
    }
}