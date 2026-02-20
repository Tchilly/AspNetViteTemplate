using System.Diagnostics;
using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Template.Web.Database;
using Template.Web.Database.Seeders;

var runner = new ArtisanCli();
return runner.Run(args);

internal sealed class ArtisanCli
{
    private readonly string _solutionRoot;
    private readonly string _webPath;
    private readonly string _webProject;

    public ArtisanCli()
    {
        _solutionRoot = FindSolutionRoot();
        _webPath = Path.Combine(_solutionRoot, "Template.Web");
        _webProject = Path.Combine(_webPath, "Template.Web.csproj");
    }

    public int Run(string[] args)
    {
        if (args.Length == 0 || args[0] is "help" or "--help" or "-h")
        {
            PrintHelp();
            return 0;
        }

        var command = args[0].ToLowerInvariant();
        var name = args.Length > 1 ? args[1] : string.Empty;

        return command switch
        {
            "make:controller" => MakeController(name),
            "make:model" => MakeModel(name),
            "make:migration" => MakeMigration(name),
            "db:fresh" => MigrateFresh(args.Skip(1).ToArray()),
            _ => UnknownCommand(command)
        };
    }

    private int MakeController(string name)
    {
        if (!EnsureNameProvided(name, "controller"))
        {
            return 1;
        }

        var controllerName = EnsurePascalCase(TrimSuffix(name, "Controller"));
        var controllersDir = Path.Combine(_webPath, "Controllers");
        Directory.CreateDirectory(controllersDir);

        var controllerPath = Path.Combine(controllersDir, $"{controllerName}Controller.cs");
        if (File.Exists(controllerPath))
        {
            Console.WriteLine($"Controller already exists: {controllerPath}");
            return 0;
        }

        var content = $$"""
using Microsoft.AspNetCore.Mvc;

namespace Template.Web.Controllers;

public sealed class {{controllerName}}Controller : Controller
{
    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }
}
""";

        File.WriteAllText(controllerPath, content);
        Console.WriteLine($"Created controller: {controllerPath}");
        return 0;
    }

    private int MakeModel(string name)
    {
        if (!EnsureNameProvided(name, "model"))
        {
            return 1;
        }

        var modelName = EnsurePascalCase(name);
        var modelsDir = Path.Combine(_webPath, "Models");
        Directory.CreateDirectory(modelsDir);

        var modelPath = Path.Combine(modelsDir, $"{modelName}.cs");
        if (File.Exists(modelPath))
        {
            Console.WriteLine($"Model already exists: {modelPath}");
            return 0;
        }

        var content = $$"""
namespace Template.Web.Models;

public class {{modelName}}
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
""";

        File.WriteAllText(modelPath, content);
        Console.WriteLine($"Created model: {modelPath}");
        return 0;
    }

    private int MakeMigration(string name)
    {
        if (!EnsureNameProvided(name, "migration"))
        {
            return 1;
        }

        var migrationName = EnsurePascalCase(name);
        Directory.CreateDirectory(Path.Combine(_webPath, "Database", "Migrations"));
        var arguments =
            $"ef migrations add {migrationName} --project \"{_webProject}\" --startup-project \"{_webProject}\" --output-dir \"Database/Migrations\"";
        return RunProcess("dotnet", arguments, _solutionRoot);
    }

    private int MigrateFresh(string[] args)
    {
        var seed = args.Contains("--seed", StringComparer.OrdinalIgnoreCase);
        var originalDirectory = Environment.CurrentDirectory;
        try
        {
            Directory.SetCurrentDirectory(_solutionRoot);
            var factory = new AppDbContextFactory();
            using var db = factory.CreateDbContext(Array.Empty<string>());
            db.Database.EnsureDeleted();
            db.Database.Migrate();
            if (seed)
            {
                DbSeeder.Seed(db);
            }
        }
        finally
        {
            Directory.SetCurrentDirectory(originalDirectory);
        }

        Console.WriteLine($"Database migrated{(seed ? " and seeded" : "")}.");
        return 0;
    }

    private int UnknownCommand(string command)
    {
        Console.WriteLine($"Unknown command: {command}");
        PrintHelp();
        return 1;
    }

    private static string TrimSuffix(string name, string suffix)
    {
        return name.EndsWith(suffix, StringComparison.OrdinalIgnoreCase)
            ? name[..^suffix.Length]
            : name;
    }

    private static string EnsurePascalCase(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return value;
        }

        var textInfo = CultureInfo.InvariantCulture.TextInfo;
        var tokens = value.Split(new[] { '-', '_', ' ' }, StringSplitOptions.RemoveEmptyEntries);
        return string.Concat(tokens.Select(token =>
        {
            var lower = token.ToLowerInvariant();
            return textInfo.ToTitleCase(lower);
        }));
    }

    private static string FindSolutionRoot()
    {
        var current = new DirectoryInfo(Environment.CurrentDirectory);
        while (current is not null)
        {
            if (File.Exists(Path.Combine(current.FullName, "Template.sln")))
            {
                return current.FullName;
            }

            current = current.Parent;
        }

        throw new InvalidOperationException("Could not locate solution root containing Template.sln.");
    }

    private static void PrintHelp()
    {
        Console.WriteLine("""
Template CLI (artisan-style)
Commands:
  make:controller <Name>   Create a controller in Template.Web/Controllers
  make:model <Name>        Create a model in Template.Web/Models
  make:migration <Name>    Run dotnet ef to add a migration into Database/Migrations
  db:fresh [--seed]        Drop, migrate, and optionally seed the database
""");
    }

    private static bool EnsureNameProvided(string value, string subject)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        Console.WriteLine($"Please provide a {subject} name.");
        PrintHelp();
        return false;
    }

    private static int RunProcess(string fileName, string arguments, string? workingDirectory = null)
    {
        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = fileName,
                Arguments = arguments,
                WorkingDirectory = workingDirectory ?? Environment.CurrentDirectory,
                UseShellExecute = false,
                RedirectStandardError = true,
                RedirectStandardOutput = true
            }
        };

        process.Start();
        var output = process.StandardOutput.ReadToEnd().Trim();
        var error = process.StandardError.ReadToEnd().Trim();
        process.WaitForExit();

        if (!string.IsNullOrEmpty(output))
        {
            Console.WriteLine(output);
        }

        if (!string.IsNullOrEmpty(error))
        {
            Console.Error.WriteLine(error);
        }

        return process.ExitCode;
    }
}
