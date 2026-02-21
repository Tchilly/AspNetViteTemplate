using InertiaCore;
using Microsoft.AspNetCore.Mvc;
using Template.Web.Requests;
using Template.Web.Store;

namespace Template.Web.Controllers;

[Route("todos")]
public sealed class TodosController : Controller
{
    private readonly ITodoStore _todoStore;

    /// <summary>
    /// Initialize a new todos controller.
    /// </summary>
    /// <param name="todoStore">The todo store abstraction.</param>
    public TodosController(ITodoStore todoStore)
    {
        _todoStore = todoStore;
    }

    /// <summary>
    /// Display a listing of the resource.
    /// </summary>
    /// <returns>The todos page response.</returns>
    [HttpGet("")]
    public IActionResult Index()
    {
        return Inertia.Render("Todos/Index", new
        {
            todos = _todoStore.All(),
        });
    }

    /// <summary>
    /// Store a newly created resource in storage.
    /// </summary>
    /// <param name="request">The request payload.</param>
    /// <returns>A redirect response on success; otherwise the index response.</returns>
    [HttpPost("")]
    public IActionResult Store([FromBody] TodoCreateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return Index();
        }

        _todoStore.Create(request.Title.Trim());
        _todoStore.Save();
        return RedirectToAction(nameof(Index));
    }

    /// <summary>
    /// Update the specified resource in storage.
    /// </summary>
    /// <param name="id">The resource id.</param>
    /// <param name="request">The request payload.</param>
    /// <returns>A redirect response on success; otherwise a not found response.</returns>
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

        _todoStore.Save();
        return RedirectToAction(nameof(Index));
    }

    /// <summary>
    /// Remove the specified resource from storage.
    /// </summary>
    /// <param name="id">The resource id.</param>
    /// <returns>A redirect response on success; otherwise a not found response.</returns>
    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        if (!_todoStore.Delete(id))
        {
            return NotFound();
        }

        _todoStore.Save();
        return RedirectToAction(nameof(Index));
    }
}
