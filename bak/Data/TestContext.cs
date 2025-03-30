namespace Test.Data;
using Microsoft.EntityFrameworkCore;
using Test.Models;

public class TestContext : DbContext
{
    public DbSet<TestModel> Test { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=test.sqlite");
        base.OnConfiguring(optionsBuilder);
    }
}