using FluentValidation;
using Template.Web.Models;

namespace Template.Web.Validators;

public sealed class TodoCreateRequestValidator : AbstractValidator<TodoCreateRequest>
{
    public TodoCreateRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);
    }
}
