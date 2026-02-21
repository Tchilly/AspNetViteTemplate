using Template.Web.Database.Factories;

namespace Template.Web.Database.Seeders;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Todos.Any())
        {
            return;
        }

        var seedTodos = TodoFactory.Generate(12).ToArray();
        db.Todos.AddRange(seedTodos);
        db.SaveChanges();
    }
}
