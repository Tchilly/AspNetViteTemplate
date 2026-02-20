using Template.Web.Models;
using Template.Web.Services;

namespace Template.Web.Data;

public sealed class DatabaseTodoStore : ITodoStore
{
    private readonly AppDbContext _db;

    public DatabaseTodoStore(AppDbContext db)
    {
        _db = db;
    }

    public IReadOnlyList<Todo> All()
    {
        return _db.Todos.OrderBy(t => t.Id).ToList();
    }

    public Todo Create(string title)
    {
        var todo = new Todo { Title = title, IsCompleted = false };
        _db.Todos.Add(todo);
        _db.SaveChanges();
        return todo;
    }

    public Todo? Update(int id, string title, bool isCompleted)
    {
        var todo = _db.Todos.Find(id);
        if (todo is null)
        {
            return null;
        }

        todo.Title = title;
        todo.IsCompleted = isCompleted;
        _db.SaveChanges();
        return todo;
    }

    public bool Delete(int id)
    {
        var todo = _db.Todos.Find(id);
        if (todo is null)
        {
            return false;
        }

        _db.Todos.Remove(todo);
        _db.SaveChanges();
        return true;
    }
}
