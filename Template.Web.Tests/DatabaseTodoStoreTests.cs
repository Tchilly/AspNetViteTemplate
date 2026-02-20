using Microsoft.EntityFrameworkCore;
using Template.Web.Data;
using Template.Web.Database.Seeders;

namespace Template.Web.Tests;

public sealed class DatabaseTodoStoreTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public void Create_AddsTodo_AndReturnsWithId()
    {
        using var db = CreateDbContext();
        var store = new DatabaseTodoStore(db);

        var todo = store.Create("Buy milk");

        Assert.NotEqual(0, todo.Id);
        Assert.Equal("Buy milk", todo.Title);
        Assert.False(todo.IsCompleted);
    }

    [Fact]
    public void All_ReturnsAllTodos()
    {
        using var db = CreateDbContext();
        var store = new DatabaseTodoStore(db);
        store.Create("First");
        store.Create("Second");

        var todos = store.All();

        Assert.Equal(2, todos.Count);
    }

    [Fact]
    public void Update_WithExistingId_UpdatesTodo_AndReturnsIt()
    {
        using var db = CreateDbContext();
        var store = new DatabaseTodoStore(db);
        var created = store.Create("Old title");

        var updated = store.Update(created.Id, "New title", true);

        Assert.NotNull(updated);
        Assert.Equal("New title", updated.Title);
        Assert.True(updated.IsCompleted);
    }

    [Fact]
    public void Update_WithMissingId_ReturnsNull()
    {
        using var db = CreateDbContext();
        var store = new DatabaseTodoStore(db);

        var result = store.Update(999, "Title", false);

        Assert.Null(result);
    }

    [Fact]
    public void Delete_WithExistingId_RemovesTodo_AndReturnsTrue()
    {
        using var db = CreateDbContext();
        var store = new DatabaseTodoStore(db);
        var created = store.Create("Delete me");

        var deleted = store.Delete(created.Id);

        Assert.True(deleted);
        Assert.Empty(store.All());
    }

    [Fact]
    public void Delete_WithMissingId_ReturnsFalse()
    {
        using var db = CreateDbContext();
        var store = new DatabaseTodoStore(db);

        var result = store.Delete(999);

        Assert.False(result);
    }

    [Fact]
    public void DbSeeder_Seed_PopulatesDatabase()
    {
        using var db = CreateDbContext();

        DbSeeder.Seed(db);

        Assert.NotEmpty(db.Todos);
    }

    [Fact]
    public void DbSeeder_Seed_IsIdempotent()
    {
        using var db = CreateDbContext();

        DbSeeder.Seed(db);
        var countAfterFirst = db.Todos.Count();
        DbSeeder.Seed(db);
        var countAfterSecond = db.Todos.Count();

        Assert.Equal(countAfterFirst, countAfterSecond);
    }
}
