using System.ComponentModel.DataAnnotations;

namespace Template.Web.Models;

public sealed class Todo
{
    public int Id { get; init; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }
}
