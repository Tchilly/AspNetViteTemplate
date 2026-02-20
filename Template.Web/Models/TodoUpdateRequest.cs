using FluentValidation;

namespace Template.Web.Models;

public sealed class TodoUpdateRequest
{
    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }

    public sealed class Validator : AbstractValidator<TodoUpdateRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .MaximumLength(200);
        }
    }
}
