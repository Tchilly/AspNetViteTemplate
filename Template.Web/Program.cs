using Vite.AspNetCore;
using FluentValidation;
using FluentValidation.AspNetCore;
using InertiaCore.Extensions;
using Microsoft.EntityFrameworkCore;
using Template.Web.Data;
using Template.Web.Services;
using Template.Web.Models;

var builder = WebApplication.CreateBuilder(args);
var mvcBuilder = builder.Services.AddRazorPages();

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddRazorPages().AddRazorRuntimeCompilation();
builder.Services.AddInertia(options => options.RootView = "~/Views/App.cshtml");

// Configure database provider based on "Database:Provider" setting.
// Use "sqlite" (default), "sqlserver", or "postgres".
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=app.db";
var dbProvider = builder.Configuration["Database:Provider"] ?? "sqlite";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    switch (dbProvider.ToLowerInvariant())
    {
        case "sqlserver":
            options.UseSqlServer(connectionString);
            break;
        case "postgres":
            options.UseNpgsql(connectionString);
            break;
        default:
            options.UseSqlite(connectionString);
            break;
    }
});

builder.Services.AddScoped<ITodoStore, DatabaseTodoStore>();

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<TodoCreateRequest>();

// Add the Vite services
builder.Services.AddViteServices(options =>
{
    options.Server.AutoRun = true;
    options.Server.Https = false;
    options.Manifest = "manifest.json";
});

if (builder.Environment.IsDevelopment())
{
    mvcBuilder.AddRazorRuntimeCompilation();
}

var app = builder.Build();

// Apply pending migrations on startup.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseInertia();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Todos}/{action=Index}/{id?}");

// Add Vite development server middleware in development environment
if (app.Environment.IsDevelopment())
{
    app.UseWebSockets();
    app.UseViteDevelopmentServer(true);
}

app.Run();
