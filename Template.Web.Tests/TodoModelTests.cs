using Template.Web.Models;
using Template.Web.Requests;

namespace Template.Web.Tests;

public sealed class TodoModelTests
{
    [Fact]
    public void TodoCreateRequestValidator_Requires_Title()
    {
        var validator = new TodoCreateRequest.Validator();
        var request = new TodoCreateRequest { Title = string.Empty };

        var result = validator.Validate(request);

        Assert.False(result.IsValid);
    }

    [Theory]
    [InlineData("   ")]
    [InlineData("")]
    public void TodoCreateRequestValidator_Rejects_Blank_Title(string title)
    {
        var validator = new TodoCreateRequest.Validator();
        var request = new TodoCreateRequest { Title = title };

        var result = validator.Validate(request);

        Assert.False(result.IsValid);
    }

    [Fact]
    public void TodoCreateRequestValidator_Rejects_Title_Over_200_Characters()
    {
        var validator = new TodoCreateRequest.Validator();
        var request = new TodoCreateRequest { Title = new string('a', 201) };

        var result = validator.Validate(request);

        Assert.False(result.IsValid);
    }

    [Fact]
    public void TodoUpdateRequestValidator_Rejects_Title_Over_200_Characters()
    {
        var validator = new TodoUpdateRequest.Validator();
        var request = new TodoUpdateRequest { Title = new string('a', 201), IsCompleted = true };

        var result = validator.Validate(request);

        Assert.False(result.IsValid);
    }
}
