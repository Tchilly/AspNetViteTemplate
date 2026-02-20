using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Template.Web.Data;

namespace Template.Web.Database;

public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var webPath = Path.Combine(basePath, "Template.Web");
        if (!File.Exists(Path.Combine(basePath, "appsettings.json")) && Directory.Exists(webPath))
        {
            basePath = webPath;
        }

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var provider = configuration["Database:Provider"] ?? "sqlite";
        var connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=app.db";

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        switch (provider.ToLowerInvariant())
        {
            case "sqlserver":
                optionsBuilder.UseSqlServer(connectionString);
                break;
            case "postgres":
                optionsBuilder.UseNpgsql(connectionString);
                break;
            default:
                optionsBuilder.UseSqlite(connectionString);
                break;
        }

        return new AppDbContext(optionsBuilder.Options);
    }
}
