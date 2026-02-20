using System.ComponentModel.DataAnnotations;

namespace Template.Web.Models;

public sealed class TodoCreateRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
}
