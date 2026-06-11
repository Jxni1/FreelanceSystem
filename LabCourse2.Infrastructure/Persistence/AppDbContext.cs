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
            });

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