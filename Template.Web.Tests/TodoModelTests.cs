using System.ComponentModel.DataAnnotations;
using Template.Web.Models;

namespace Template.Web.Tests;

public sealed class TodoModelTests
{
    [Fact]
    public void TodoCreateRequest_Requires_Title()
    {
        var request = new TodoCreateRequest { Title = string.Empty };

        var isValid = Validator.TryValidateObject(request, new ValidationContext(request), new List<ValidationResult>(), true);

        Assert.False(isValid);
    }

    [Fact]
    public void TodoUpdateRequest_Rejects_Title_Over_200_Characters()
    {
        var request = new TodoUpdateRequest { Title = new string('a', 201), IsCompleted = true };

        var isValid = Validator.TryValidateObject(request, new ValidationContext(request), new List<ValidationResult>(), true);

        Assert.False(isValid);
    }
}
