using Vite.AspNetCore;
using FluentValidation;
using FluentValidation.AspNetCore;
using InertiaCore.Extensions;
using Template.Web.Services;
using Template.Web.Validators;

var builder = WebApplication.CreateBuilder(args);
var mvcBuilder = builder.Services.AddRazorPages();

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddRazorPages().AddRazorRuntimeCompilation();
builder.Services.AddInertia(options => options.RootView = "~/Views/App.cshtml");
builder.Services.AddSingleton<ITodoStore, InMemoryTodoStore>();

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<TodoCreateRequestValidator>();

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
