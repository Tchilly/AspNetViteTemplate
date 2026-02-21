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
        var commandArgs = args.Skip(1).ToArray();
        var name = commandArgs.FirstOrDefault() ?? string.Empty;

        return command switch
        {
            "make:controller" => MakeController(name, commandArgs.Skip(1).ToArray()),
            "make:model" => MakeModel(name, commandArgs.Skip(1).ToArray()),
            "make:migration" => MakeMigration(name),
            "make:request" => MakeRequest(name),
            "make:factory" => MakeFactory(name),
            "make:seeder" => MakeSeeder(name),
            "db:fresh" => MigrateFresh(args.Skip(1).ToArray()),
            _ => UnknownCommand(command)
        };
    }

    private int MakeController(string name, string[] options)
    {
        if (!EnsureNameProvided(name, "controller"))
        {
            return 1;
        }

        var controllerName = EnsurePascalCase(TrimSuffix(name, "Controller"));

        var scaffoldOptions = ControllerScaffoldOptions.Parse(options);
        if (!scaffoldOptions.Resource)
        {
            CreateControllerFile(controllerName);
            return 0;
        }

        var modelName = ToSingular(controllerName);

        CreateResourceControllerFile(controllerName, modelName);
        CreateStoreInterfaceFile(modelName);
        CreateStoreFile(modelName);
        CreateCreateRequestFile(modelName);
        CreateUpdateRequestFile(modelName);
        RegisterStoreInProgram(modelName);

        return 0;
    }

    private int MakeModel(string name, string[] options)
    {
        if (!EnsureNameProvided(name, "model"))
        {
            return 1;
        }

        var modelName = EnsurePascalCase(name);
        CreateModelFile(modelName);

        var scaffoldOptions = ModelScaffoldOptions.Parse(options);
        if (!scaffoldOptions.HasAny)
        {
            return 0;
        }

        if (scaffoldOptions.Resource)
        {
            CreateResourceControllerFile(ToPlural(modelName), modelName);
            CreateStoreInterfaceFile(modelName);
            CreateStoreFile(modelName);
            CreateCreateRequestFile(modelName);
            CreateUpdateRequestFile(modelName);
            RegisterStoreInProgram(modelName);
        }
        else if (scaffoldOptions.Controller)
        {
            CreateControllerFile(ToPlural(modelName));
        }

        if (scaffoldOptions.Request)
        {
            CreateCreateRequestFile(modelName);
            CreateUpdateRequestFile(modelName);
        }

        if (scaffoldOptions.Factory)
        {
            CreateFactoryFile(modelName);
        }

        if (scaffoldOptions.Seeder)
        {
            CreateSeederFile(modelName);
        }

        if (scaffoldOptions.Migration)
        {
            var migrationName = $"Create{ToPlural(modelName)}Table";
            return MakeMigration(migrationName);
        }

        return 0;
    }

    private int MakeRequest(string name)
    {
        if (!EnsureNameProvided(name, "request"))
        {
            return 1;
        }

        var requestName = EnsurePascalCase(TrimSuffix(name, "Request"));
        CreateRequestFile($"{requestName}Request");
        return 0;
    }

    private int MakeFactory(string name)
    {
        if (!EnsureNameProvided(name, "factory"))
        {
            return 1;
        }

        var modelName = EnsurePascalCase(TrimSuffix(name, "Factory"));
        CreateFactoryFile(modelName);
        return 0;
    }

    private int MakeSeeder(string name)
    {
        if (!EnsureNameProvided(name, "seeder"))
        {
            return 1;
        }

        var modelName = EnsurePascalCase(TrimSuffix(name, "Seeder"));
        CreateSeederFile(modelName);
        return 0;
    }

    private void CreateControllerFile(string controllerName)
    {
        var controllersDir = Path.Combine(_webPath, "Controllers");
        Directory.CreateDirectory(controllersDir);

        var controllerPath = Path.Combine(controllersDir, $"{controllerName}Controller.cs");
        if (File.Exists(controllerPath))
        {
            Console.WriteLine($"Controller already exists: {controllerPath}");
            return;
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
    }

    private void CreateResourceControllerFile(string controllerName, string modelName)
    {
        var controllersDir = Path.Combine(_webPath, "Controllers");
        Directory.CreateDirectory(controllersDir);

        var controllerPath = Path.Combine(controllersDir, $"{controllerName}Controller.cs");
        if (File.Exists(controllerPath))
        {
            Console.WriteLine($"Controller already exists: {controllerPath}");
            return;
        }

        var route = ToKebabCase(ToPlural(modelName));
        var storeInterface = $"I{modelName}Store";
        var createRequest = $"{modelName}CreateRequest";
        var updateRequest = $"{modelName}UpdateRequest";

        var content = $$"""
using Microsoft.AspNetCore.Mvc;
using Template.Web.Models;
using Template.Web.Requests;
using Template.Web.Store;

namespace Template.Web.Controllers;

[Route("{{route}}")]
public sealed class {{controllerName}}Controller : Controller
{
    private readonly {{storeInterface}} _store;

    public {{controllerName}}Controller({{storeInterface}} store)
    {
        _store = store;
    }

    [HttpGet("")]
    public IActionResult Index()
    {
        return Ok(_store.All());
    }

    [HttpGet("{id:int}")]
    public IActionResult Show(int id)
    {
        var resource = _store.Find(id);
        return resource is null ? NotFound() : Ok(resource);
    }

    [HttpPost("")]
    public IActionResult Store([FromBody] {{createRequest}} request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var resource = new {{modelName}}();
        _store.Create(resource);
        _store.Save();

        return CreatedAtAction(nameof(Show), new { id = resource.Id }, resource);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, [FromBody] {{updateRequest}} request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var resource = _store.Find(id);
        if (resource is null)
        {
            return NotFound();
        }

        _store.Update(resource);
        _store.Save();
        return Ok(resource);
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        if (!_store.Delete(id))
        {
            return NotFound();
        }

        _store.Save();
        return NoContent();
    }
}
""";

        File.WriteAllText(controllerPath, content);
        Console.WriteLine($"Created controller: {controllerPath}");
    }

    private void CreateModelFile(string modelName)
    {
        var modelsDir = Path.Combine(_webPath, "Models");
        Directory.CreateDirectory(modelsDir);

        var modelPath = Path.Combine(modelsDir, $"{modelName}.cs");
        if (File.Exists(modelPath))
        {
            Console.WriteLine($"Model already exists: {modelPath}");
            return;
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
    }

    private void CreateRequestFile(string requestName)
    {
        var requestsDir = Path.Combine(_webPath, "Requests");
        Directory.CreateDirectory(requestsDir);

        var requestPath = Path.Combine(requestsDir, $"{requestName}.cs");
        if (File.Exists(requestPath))
        {
            Console.WriteLine($"Request already exists: {requestPath}");
            return;
        }

        var content = $$"""
using FluentValidation;

namespace Template.Web.Requests;

public sealed class {{requestName}}
{
    public string Name { get; set; } = string.Empty;

    public sealed class Validator : AbstractValidator<{{requestName}}>
    {
        public Validator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(200);
        }
    }
}
""";

        File.WriteAllText(requestPath, content);
        Console.WriteLine($"Created request: {requestPath}");
    }

    private void CreateCreateRequestFile(string modelName)
    {
        CreateRequestFile($"{modelName}CreateRequest");
    }

    private void CreateUpdateRequestFile(string modelName)
    {
        CreateRequestFile($"{modelName}UpdateRequest");
    }

    private void CreateFactoryFile(string modelName)
    {
        var factoriesDir = Path.Combine(_webPath, "Database", "Factories");
        Directory.CreateDirectory(factoriesDir);

        var factoryPath = Path.Combine(factoriesDir, $"{modelName}Factory.cs");
        if (File.Exists(factoryPath))
        {
            Console.WriteLine($"Factory already exists: {factoryPath}");
            return;
        }

        var content = $$"""
using Bogus;
using Template.Web.Models;

namespace Template.Web.Database.Factories;

public static class {{modelName}}Factory
{
    private static readonly Faker<{{modelName}}> Faker = new Faker<{{modelName}}>()
        .RuleFor(x => x.Id, _ => 0);

    public static IEnumerable<{{modelName}}> Generate(int count)
    {
        return Enumerable.Range(0, count).Select(_ => Faker.Generate());
    }
}
""";

        File.WriteAllText(factoryPath, content);
        Console.WriteLine($"Created factory: {factoryPath}");
    }

    private void CreateSeederFile(string modelName)
    {
        var seedersDir = Path.Combine(_webPath, "Database", "Seeders");
        Directory.CreateDirectory(seedersDir);

        var seederName = $"{modelName}Seeder";
        var seederPath = Path.Combine(seedersDir, $"{seederName}.cs");
        if (File.Exists(seederPath))
        {
            Console.WriteLine($"Seeder already exists: {seederPath}");
            return;
        }

        var content = $$"""
namespace Template.Web.Database.Seeders;

public static class {{seederName}}
{
    public static void Seed(AppDbContext db)
    {
    }
}
""";

        File.WriteAllText(seederPath, content);
        Console.WriteLine($"Created seeder: {seederPath}");
    }

    private void CreateStoreInterfaceFile(string modelName)
    {
        var storeDir = Path.Combine(_webPath, "Store");
        Directory.CreateDirectory(storeDir);

        var storeInterfacePath = Path.Combine(storeDir, $"I{modelName}Store.cs");
        if (File.Exists(storeInterfacePath))
        {
            Console.WriteLine($"Store interface already exists: {storeInterfacePath}");
            return;
        }

        var content = $$"""
using Template.Web.Models;

namespace Template.Web.Store;

public interface I{{modelName}}Store : IStore<{{modelName}}, int>
{
}
""";

        File.WriteAllText(storeInterfacePath, content);
        Console.WriteLine($"Created store interface: {storeInterfacePath}");
    }

    private void CreateStoreFile(string modelName)
    {
        var storeDir = Path.Combine(_webPath, "Store");
        Directory.CreateDirectory(storeDir);

        var storePath = Path.Combine(storeDir, $"{modelName}Store.cs");
        if (File.Exists(storePath))
        {
            Console.WriteLine($"Store already exists: {storePath}");
            return;
        }

        var content = $$"""
using Template.Web.Database;
using Template.Web.Models;

namespace Template.Web.Store;

public sealed class {{modelName}}Store : StoreBase<{{modelName}}, int>, I{{modelName}}Store
{
    public {{modelName}}Store(AppDbContext db) : base(db, db.Set<{{modelName}}>())
    {
    }

    public override IReadOnlyList<{{modelName}}> All()
    {
        return Set.OrderBy(resource => resource.Id).ToList();
    }
}
""";

        File.WriteAllText(storePath, content);
        Console.WriteLine($"Created store: {storePath}");
    }

    private void RegisterStoreInProgram(string modelName)
    {
        var programPath = Path.Combine(_webPath, "Program.cs");
        if (!File.Exists(programPath))
        {
            return;
        }

        var registration = $"builder.Services.AddScoped<I{modelName}Store, {modelName}Store>();";
        var programContent = File.ReadAllText(programPath);
        if (programContent.Contains(registration, StringComparison.Ordinal))
        {
            return;
        }

        if (programContent.Contains("builder.Services.AddScoped<ITodoStore, TodoStore>();", StringComparison.Ordinal))
        {
            programContent = programContent.Replace(
                "builder.Services.AddScoped<ITodoStore, TodoStore>();",
                $"builder.Services.AddScoped<ITodoStore, TodoStore>();{Environment.NewLine}{registration}");
        }
        else if (programContent.Contains("builder.Services.AddFluentValidationAutoValidation();", StringComparison.Ordinal))
        {
            programContent = programContent.Replace(
                "builder.Services.AddFluentValidationAutoValidation();",
                $"{registration}{Environment.NewLine}{Environment.NewLine}builder.Services.AddFluentValidationAutoValidation();");
        }
        else
        {
            programContent += $"{Environment.NewLine}{registration}{Environment.NewLine}";
        }

        File.WriteAllText(programPath, programContent);
        Console.WriteLine($"Registered store in Program.cs: {registration}");
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

    private static string ToPlural(string value)
    {
        if (value.EndsWith("y", StringComparison.OrdinalIgnoreCase) && value.Length > 1)
        {
            return $"{value[..^1]}ies";
        }

        if (value.EndsWith("s", StringComparison.OrdinalIgnoreCase))
        {
            return value;
        }

        return $"{value}s";
    }

    private static string ToSingular(string value)
    {
        if (value.EndsWith("ies", StringComparison.OrdinalIgnoreCase) && value.Length > 3)
        {
            return $"{value[..^3]}y";
        }

        if (value.EndsWith("s", StringComparison.OrdinalIgnoreCase) && value.Length > 1)
        {
            return value[..^1];
        }

        return value;
    }

    private static string ToKebabCase(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return value;
        }

        var buffer = new List<char>(value.Length * 2);
        for (var index = 0; index < value.Length; index++)
        {
            var current = value[index];
            if (char.IsUpper(current) && index > 0)
            {
                buffer.Add('-');
            }

            buffer.Add(char.ToLowerInvariant(current));
        }

        return new string(buffer.ToArray());
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
dn CLI (DotNet scaffolding)
Commands:
  make:controller <Name>   Create a controller in Template.Web/Controllers
                                                    Modifiers: -R (resource controller + store + requests)
    make:model <Name>        Create a model in Template.Web/Models
                                                    Modifiers: -a (all + resource), -m (migration), -s (seeder), -r (requests), -R (resource), -c (controller), -f (factory)
  make:migration <Name>    Run dotnet ef to add a migration into Database/Migrations
    make:request <Name>      Create a request in Template.Web/Requests
    make:factory <Name>      Create a factory in Template.Web/Database/Factories
    make:seeder <Name>       Create a seeder in Template.Web/Database/Seeders
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

internal readonly record struct ControllerScaffoldOptions(bool Resource)
{
    public static ControllerScaffoldOptions Parse(string[] options)
    {
        var normalized = ModelScaffoldOptions.ExpandShortOptions(options);
        var resource = normalized.Any(option =>
            option.Equals("-R", StringComparison.OrdinalIgnoreCase) ||
            option.Equals("--resource", StringComparison.OrdinalIgnoreCase));

        return new ControllerScaffoldOptions(resource);
    }
}

internal readonly record struct ModelScaffoldOptions(
    bool Migration,
    bool Seeder,
    bool Request,
    bool Controller,
    bool Factory,
    bool Resource)
{
    public bool HasAny => Migration || Seeder || Request || Controller || Factory || Resource;

    public static ModelScaffoldOptions Parse(string[] options)
    {
        var normalized = ExpandShortOptions(options);
        var all = Has(normalized, "-a", "--all");

        return new ModelScaffoldOptions(
            Migration: all || Has(normalized, "-m", "--migration"),
            Seeder: all || Has(normalized, "-s", "--seeder"),
            Request: all || Has(normalized, "-r", "--request"),
            Controller: all || Has(normalized, "-c", "--controller"),
            Factory: all || Has(normalized, "-f", "--factory"),
            Resource: all || Has(normalized, "-R", "--resource")
        );
    }

    internal static string[] ExpandShortOptions(IEnumerable<string> options)
    {
        var expanded = new List<string>();

        foreach (var option in options)
        {
            if (option.StartsWith("--", StringComparison.Ordinal) || option.Length <= 2 || option[0] != '-')
            {
                expanded.Add(option);
                continue;
            }

            foreach (var shortFlag in option[1..])
            {
                expanded.Add($"-{shortFlag}");
            }
        }

        return expanded.ToArray();
    }

    private static bool Has(IEnumerable<string> options, params string[] values)
    {
        return options.Any(option => values.Any(value => option.Equals(value, StringComparison.OrdinalIgnoreCase)));
    }
}
