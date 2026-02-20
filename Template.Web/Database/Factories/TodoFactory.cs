using Bogus;
using Template.Web.Models;

namespace Template.Web.Database.Factories;

public static class TodoFactory
{
    private static readonly Faker<Todo> Faker = new Faker<Todo>()
        .RuleFor(t => t.Title, f => f.Lorem.Sentence(3).Trim().Truncate(200))
        .RuleFor(t => t.IsCompleted, f => f.Random.Bool(0.35f));

    public static IEnumerable<Todo> Generate(int count)
    {
        return Enumerable.Range(0, count).Select(_ => Faker.Generate());
    }

    private static string Truncate(this string value, int maxLength)
    {
        return value.Length <= maxLength ? value : value[..maxLength];
    }
}
