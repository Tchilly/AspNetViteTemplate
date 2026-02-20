using Template.Web.Models;

namespace Template.Web.Services;

public sealed class InMemoryTodoStore : ITodoStore
{
    private readonly List<Todo> _todos = [];
    private readonly object _sync = new();
    private int _nextId = 1;

    public IReadOnlyList<Todo> All()
    {
        lock (_sync)
        {
            return _todos
                .Select(todo => new Todo { Id = todo.Id, Title = todo.Title, IsCompleted = todo.IsCompleted })
                .ToList();
        }
    }

    public Todo Create(string title)
    {
        lock (_sync)
        {
            var todo = new Todo
            {
                Id = _nextId++,
                Title = title,
                IsCompleted = false,
            };

            _todos.Add(todo);

            return new Todo { Id = todo.Id, Title = todo.Title, IsCompleted = todo.IsCompleted };
        }
    }

    public Todo? Update(int id, string title, bool isCompleted)
    {
        lock (_sync)
        {
            var todo = _todos.FirstOrDefault(x => x.Id == id);
            if (todo is null)
            {
                return null;
            }

            todo.Title = title;
            todo.IsCompleted = isCompleted;

            return new Todo { Id = todo.Id, Title = todo.Title, IsCompleted = todo.IsCompleted };
        }
    }

    public bool Delete(int id)
    {
        lock (_sync)
        {
            var todo = _todos.FirstOrDefault(x => x.Id == id);
            if (todo is null)
            {
                return false;
            }

            _todos.Remove(todo);
            return true;
        }
    }
}
