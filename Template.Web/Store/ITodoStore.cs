using Template.Web.Models;

namespace Template.Web.Store;

public interface ITodoStore : IStore<Todo, int>
{
    /// <summary>
    /// Create a new todo entity and stage it for persistence.
    /// </summary>
    /// <param name="title">The todo title.</param>
    /// <returns>The created todo entity.</returns>
    Todo Create(string title);

    /// <summary>
    /// Update an existing todo by id.
    /// </summary>
    /// <param name="id">The todo id.</param>
    /// <param name="title">The updated title.</param>
    /// <param name="isCompleted">The updated completion state.</param>
    /// <returns>The updated todo, or null when not found.</returns>
    Todo? Update(int id, string title, bool isCompleted);
}
