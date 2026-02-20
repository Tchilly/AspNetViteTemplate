using System.ComponentModel.DataAnnotations;

namespace Template.Web.Models;

public sealed class TodoUpdateRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }
}
