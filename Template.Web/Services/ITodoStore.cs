using Template.Web.Models;

namespace Template.Web.Services;

public interface ITodoStore
{
    IReadOnlyList<Todo> All();
    Todo Create(string title);
    Todo? Update(int id, string title, bool isCompleted);
    bool Delete(int id);
}
