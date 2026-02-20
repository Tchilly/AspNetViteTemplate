using Microsoft.AspNetCore.Mvc;
using Template.Web.Controllers;
using Template.Web.Models;
using Template.Web.Services;

namespace Template.Web.Tests;

public sealed class TodosControllerTests
{
    [Fact]
    public void Store_WithValidRequest_CreatesTodo_AndRedirects()
    {
        var store = new InMemoryTodoStore();
        var controller = new TodosController(store);

        var result = controller.Store(new TodoCreateRequest { Title = "Buy milk" });

        var redirect = Assert.IsType<RedirectToActionResult>(result);
        Assert.Equal(nameof(TodosController.Index), redirect.ActionName);
        Assert.Single(store.All());
    }

    [Fact]
    public void Delete_WithMissingTodo_ReturnsNotFound()
    {
        var store = new InMemoryTodoStore();
        var controller = new TodosController(store);

        var result = controller.Delete(999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public void Update_WithValidRequest_UpdatesTodo_AndRedirects()
    {
        var store = new InMemoryTodoStore();
        var created = store.Create("Old title");
        var controller = new TodosController(store);

        var result = controller.Update(created.Id, new TodoUpdateRequest { Title = "New title", IsCompleted = true });

        var redirect = Assert.IsType<RedirectToActionResult>(result);
        Assert.Equal(nameof(TodosController.Index), redirect.ActionName);

        var todo = Assert.Single(store.All());
        Assert.Equal("New title", todo.Title);
        Assert.True(todo.IsCompleted);
    }

    [Fact]
    public void Delete_WithExistingTodo_RemovesTodo_AndRedirects()
    {
        var store = new InMemoryTodoStore();
        var created = store.Create("Delete me");
        var controller = new TodosController(store);

        var result = controller.Delete(created.Id);

        var redirect = Assert.IsType<RedirectToActionResult>(result);
        Assert.Equal(nameof(TodosController.Index), redirect.ActionName);
        Assert.Empty(store.All());
    }
}
