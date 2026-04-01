using LabCourse2.Domain.Entities; 
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

            modelBuilder.Entity<FreelancerProfile>(e =>
            {
                e.HasKey(f => f.FreelancerID);
                e.HasOne(f => f.User)
                 .WithOne(u => u.FreelancerProfile)
                 .HasForeignKey<FreelancerProfile>(f => f.UserID)
                 .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<Contract>(e =>
            {
                e.HasKey(c => c.ContractID);

                
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
                //e.HasKey(pv => pv.Protected_ViewsID);
                //// e.HasOne(pv => pv.Project)
                ////  .WithMany(p => p.Protected_Views)
                ////  .HasForeignKey(pv => pv.ProjectID)
                ////  .OnDelete(DeleteBehavior.Cascade);
                //e.HasOne(pv => pv.User)
                // .WithMany(u => u.Protected_Views)
                // .HasForeignKey(pv => pv.UserID)
                // .OnDelete(DeleteBehavior.Cascade);
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
        }
    }
}