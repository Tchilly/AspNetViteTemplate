namespace Template.Web.Models;

public sealed class Todo
{
    public int Id { get; init; }

    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }
}
