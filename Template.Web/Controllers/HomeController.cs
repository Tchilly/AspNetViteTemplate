using System.Diagnostics;
using InertiaCore;
using Microsoft.AspNetCore.Mvc;
using Template.Web.Models;

namespace Template.Web.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    [HttpGet("/")]
    public IActionResult Index()
    {
        return Inertia.Render("Home/Index", new
        {
            appName = "AspNetViteTemplate",
        });
    }

    [HttpGet("/privacy")]
    public IActionResult Privacy()
    {
        return Inertia.Render("Home/Privacy");
    }

    [HttpGet("/error")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
