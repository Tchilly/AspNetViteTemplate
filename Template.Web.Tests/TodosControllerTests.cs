using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Template.Web.Controllers;
using Template.Web.Database;
using Template.Web.Models;
using Template.Web.Requests;
using Template.Web.Store;

namespace Template.Web.Tests;

public sealed class TodosControllerTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public void Store_WithValidRequest_CreatesTodo_AndRedirects()
    {
        using var db = CreateDbContext();
        var store = new TodoStore(db);
        var controller = new TodosController(store);

        var result = controller.Store(new TodoCreateRequest { Title = "Buy milk" });

        var redirect = Assert.IsType<RedirectToActionResult>(result);
        Assert.Equal(nameof(TodosController.Index), redirect.ActionName);
        Assert.Single(db.Todos);
    }

    [Fact]
    public void Delete_WithMissingTodo_ReturnsNotFound()
    {
        using var db = CreateDbContext();
        var store = new TodoStore(db);
        var controller = new TodosController(store);

        var result = controller.Delete(999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public void Update_WithValidRequest_UpdatesTodo_AndRedirects()
    {
        using var db = CreateDbContext();
        var created = new Todo { Title = "Old title", IsCompleted = false };
        db.Todos.Add(created);
        db.SaveChanges();
        var store = new TodoStore(db);
        var controller = new TodosController(store);

        var result = controller.Update(created.Id, new TodoUpdateRequest { Title = "New title", IsCompleted = true });

        var redirect = Assert.IsType<RedirectToActionResult>(result);
        Assert.Equal(nameof(TodosController.Index), redirect.ActionName);

        var todo = Assert.Single(db.Todos);
        Assert.Equal("New title", todo.Title);
        Assert.True(todo.IsCompleted);
    }

    [Fact]
    public void Delete_WithExistingTodo_RemovesTodo_AndRedirects()
    {
        using var db = CreateDbContext();
        var created = new Todo { Title = "Delete me", IsCompleted = false };
        db.Todos.Add(created);
        db.SaveChanges();
        var store = new TodoStore(db);
        var controller = new TodosController(store);

        var result = controller.Delete(created.Id);

        var redirect = Assert.IsType<RedirectToActionResult>(result);
        Assert.Equal(nameof(TodosController.Index), redirect.ActionName);
        Assert.Empty(db.Todos);
    }
}
