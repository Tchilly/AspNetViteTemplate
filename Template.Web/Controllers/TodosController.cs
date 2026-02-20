using InertiaCore;
using Microsoft.AspNetCore.Mvc;
using Template.Web.Models;
using Template.Web.Services;

namespace Template.Web.Controllers;

[Route("todos")]
public sealed class TodosController : Controller
{
    private readonly ITodoStore _todoStore;

    public TodosController(ITodoStore todoStore)
    {
        _todoStore = todoStore;
    }

    [HttpGet("")]
    public IActionResult Index()
    {
        return Inertia.Render("Todos/Index", new
        {
            todos = _todoStore.All(),
        });
    }

    [HttpPost("")]
    public IActionResult Store([FromBody] TodoCreateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return Index();
        }

        _todoStore.Create(request.Title.Trim());

        return RedirectToAction(nameof(Index));
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, [FromBody] TodoUpdateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return Index();
        }

        var todo = _todoStore.Update(id, request.Title.Trim(), request.IsCompleted);
        if (todo is null)
        {
            return NotFound();
        }

        return RedirectToAction(nameof(Index));
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        if (!_todoStore.Delete(id))
        {
            return NotFound();
        }

        return RedirectToAction(nameof(Index));
    }
}
