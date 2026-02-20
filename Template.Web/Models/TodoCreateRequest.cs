using FluentValidation;

namespace Template.Web.Models;

public sealed class TodoCreateRequest
{
    public string Title { get; set; } = string.Empty;

    public sealed class Validator : AbstractValidator<TodoCreateRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .MaximumLength(200);
        }
    }
}
