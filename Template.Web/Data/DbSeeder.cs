using Template.Web.Models;

namespace Template.Web.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Todos.Any())
        {
            return;
        }

        db.Todos.AddRange(
            new Todo { Title = "Buy groceries", IsCompleted = false },
            new Todo { Title = "Walk the dog", IsCompleted = true },
            new Todo { Title = "Read a book", IsCompleted = false }
        );

        db.SaveChanges();
    }
}
