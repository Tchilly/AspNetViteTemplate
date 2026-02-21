using Template.Web.Database;
using Template.Web.Models;

namespace Template.Web.Store;

public sealed class TodoStore : StoreBase<Todo, int>, ITodoStore
{
    /// <summary>
    /// Initialize a new todo store backed by EF Core.
    /// </summary>
    /// <param name="db">The application database context.</param>
    public TodoStore(AppDbContext db) : base(db, db.Todos)
    {
    }

    /// <inheritdoc />
    public override IReadOnlyList<Todo> All()
    {
        return Set.OrderBy(todo => todo.Id).ToList();
    }

    /// <inheritdoc />
    public Todo Create(string title)
    {
        var todo = new Todo
        {
            Title = title,
            IsCompleted = false,
        };

        Set.Add(todo);
        return todo;
    }

    /// <inheritdoc />
    public Todo? Update(int id, string title, bool isCompleted)
    {
        var todo = Find(id);
        if (todo is null)
        {
            return null;
        }

        todo.Title = title;
        todo.IsCompleted = isCompleted;
        return todo;
    }
}
