using Microsoft.EntityFrameworkCore;
using Dontpad.Models;

namespace Dontpad.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Url> Urls { get; set; }
        public DbSet<Attachment> Attachments { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Url>().HasIndex(u => u.Endpoint).IsUnique();
        }
    }
}
