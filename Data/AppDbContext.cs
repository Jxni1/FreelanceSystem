using LabCourse2.Entities;
using Microsoft.EntityFrameworkCore;
using LabCourse2.Entities; 

namespace LabCourse2.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Server=127.0.0.1,1433;Database=UserDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;");
            }
        }

    }
}