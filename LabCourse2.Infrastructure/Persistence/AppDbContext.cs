using LabCourse2.Domain.Entities;
using LabCourse2.Infrastructure.Persistence.Migrations;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Infrastructure.Persistence 
{
    public class AppDbContext : DbContext
    {
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
        public DbSet<Settings> Settings => Set<Settings>();
        public DbSet<Notifications> Notifications => Set<Notifications>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>(e =>
            {
                e.HasKey(r => r.RoleID);
            });

            modelBuilder.Entity<Permission>(e =>
            {
                e.HasKey(p => p.PermissionsID);
            });

            modelBuilder.Entity<User>(e =>
            {
                e.HasKey(u => u.UserID);
                e.HasIndex(u => u.Email).IsUnique();
                e.HasIndex(u => u.Username).IsUnique();
            });

            modelBuilder.Entity<Report>(e =>
            {
                e.HasKey(r => r.ReportsID);
                e.HasOne(r => r.User)
                 .WithMany(u => u.Reports)
                 .HasForeignKey(r => r.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
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
                 .OnDelete(DeleteBehavior.NoAction);
                e.HasOne(r => r.Client)
                 .WithMany(c => c.Reviews)
                 .HasForeignKey(r => r.ClientID)
                 .OnDelete(DeleteBehavior.NoAction);
            });

           
            modelBuilder.Entity<Files>(e =>
            {
                e.HasKey(f => f.FilesID);
            });

       

          


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
                 .OnDelete(DeleteBehavior.NoAction);
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
                 .OnDelete(DeleteBehavior.NoAction);
            });


            modelBuilder.Entity<Milestone>(e =>
            {
                e.HasKey(m => m.MilestoneID);
                e.Property(m => m.Amount).HasPrecision(18, 2);
                e.HasOne(m => m.Contract)
                 .WithMany(c => c.Milestones)
                 .HasForeignKey(m => m.ContractID)
                 .OnDelete(DeleteBehavior.Cascade);
            });


            modelBuilder.Entity<FreelancerProfile>(e =>
            {
                e.HasKey(f => f.FreelancerID);
                e.Property(f => f.Hourly_Rate).HasPrecision(18, 2);
                e.HasOne(f => f.User)
                 .WithOne(u => u.FreelancerProfile)
                 .HasForeignKey<FreelancerProfile>(f => f.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<Contract>(e =>
            {
                e.HasKey(c => c.ContractID);
                e.Property(c => c.Agreed_Price).HasPrecision(18, 2);
                e.Property(c => c.Price).HasPrecision(18, 2);

                e.HasOne(c => c.Client)
                 .WithMany(cp => cp.Contracts)
                 .HasForeignKey(c => c.ClientID)
                 .OnDelete(DeleteBehavior.Cascade); 

                e.HasOne(c => c.Freelancer)
                 .WithMany(fp => fp.Contracts)
                 .HasForeignKey(c => c.FreelancerID)
                 .OnDelete(DeleteBehavior.NoAction); 
            });



            modelBuilder.Entity<ClientProfile>(e =>
            {
                e.HasKey(c => c.ClientID);
                e.Property(c => c.Budget).HasPrecision(18, 2);
                e.HasOne(c => c.User)
                 .WithOne(u => u.ClientProfile)
                 .HasForeignKey<ClientProfile>(c => c.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<RefreshToken>(e =>
            {
                e.HasKey(r => r.TokenID);
                e.HasOne(r => r.User)
                 .WithMany(u => u.RefreshTokens)
                 .HasForeignKey(r => r.UserID)
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

          
             
                modelBuilder.Entity<Protected_Views>(e =>
                {
                    e.HasKey(pv => pv.Protected_ViewsID);
                    e.HasOne(pv => pv.User)
                     .WithMany(u => u.ProtectedViews) 
                     .HasForeignKey(pv => pv.UserID)
                     .OnDelete(DeleteBehavior.Cascade);
                    //e.HasKey(pv => pv.Protected_ViewsID);
                    //// e.HasOne(pv => pv.Project)
                    ////  .WithMany(p => p.Protected_Views)
                    ////  .HasForeignKey(pv => pv.ProjectID)
                    ////  .OnDelete(DeleteBehavior.Cascade);
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

            modelBuilder.Entity<Audit_Logs>(e =>
            {
                e.HasKey(al => al.Audit_LogsID);
                e.HasOne(al => al.User)
                 .WithMany(u => u.AuditLogs)
                 .HasForeignKey(al => al.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Skills>(e =>
            {
                e.HasKey(s => s.SkillsID);
            });

            modelBuilder.Entity<Settings>(e =>
            {
                e.HasKey(s => s.SettingsID);
            });

            modelBuilder.Entity<Notifications>(e =>
            {
                e.HasKey(n => n.NotificationsID);
                e.HasOne(n => n.User)
                 .WithMany(u => u.Notifications)
                 .HasForeignKey(n => n.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasIndex(n => n.Is_read);
                e.HasIndex(n => n.Created_at);
            });
        }
    }
}