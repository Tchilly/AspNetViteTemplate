namespace Template.Web.Models;

public sealed class TodoUpdateRequest
{
    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }
}
