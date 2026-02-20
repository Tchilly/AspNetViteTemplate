using FluentValidation;
using Template.Web.Models;

namespace Template.Web.Validators;

public sealed class TodoUpdateRequestValidator : AbstractValidator<TodoUpdateRequest>
{
    public TodoUpdateRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);
    }
}
