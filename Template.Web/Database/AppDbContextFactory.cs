using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.Sqlite;

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
        var connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=Database/app.db";

        if (provider.Equals("sqlite", StringComparison.OrdinalIgnoreCase))
        {
            connectionString = ResolveSqliteConnectionString(connectionString, basePath);
        }

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

    private static string ResolveSqliteConnectionString(string connectionString, string basePath)
    {
        var sqliteBuilder = new SqliteConnectionStringBuilder(connectionString);
        if (string.IsNullOrWhiteSpace(sqliteBuilder.DataSource))
        {
            return connectionString;
        }

        var dataSourcePath = sqliteBuilder.DataSource;
        if (!Path.IsPathRooted(dataSourcePath))
        {
            dataSourcePath = Path.Combine(basePath, dataSourcePath);
        }

        var directoryPath = Path.GetDirectoryName(dataSourcePath);
        if (!string.IsNullOrWhiteSpace(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }

        sqliteBuilder.DataSource = dataSourcePath;
        return sqliteBuilder.ToString();
    }
}
