using Microsoft.Extensions.FileProviders;
using Vite.AspNetCore;
using FluentValidation;
using FluentValidation.AspNetCore;
using InertiaCore.Extensions;
using Template.Web.Services;
using Template.Web.Models;

var builder = WebApplication.CreateBuilder(args);
var mvcBuilder = builder.Services.AddRazorPages();

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddRazorPages().AddRazorRuntimeCompilation();
builder.Services.AddInertia(options => options.RootView = "~/Views/App.cshtml");
builder.Services.AddSingleton<ITodoStore, InMemoryTodoStore>();

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<TodoCreateRequest>();

// Add the Vite services
builder.Services.AddViteServices(options =>
{
    options.Server.AutoRun = true;
    options.Server.Https = false;
    options.Manifest = "build/manifest.json";
});

if (builder.Environment.IsDevelopment())
{
    mvcBuilder.AddRazorRuntimeCompilation();
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// In non-development mode serve the Vite build artifacts (css/js) from wwwroot/build/ at the root path,
// because the ViteTagHelper generates asset URLs without the /build/ prefix.
if (!app.Environment.IsDevelopment())
{
    var buildPath = Path.Combine(app.Environment.WebRootPath, "build");
    if (Directory.Exists(buildPath))
    {
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(buildPath),
            RequestPath = ""
        });
    }
}

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

public partial class Program { }
