using Microsoft.EntityFrameworkCore;
using Template.Web.Database;

namespace Template.Web.Store;

public abstract class StoreBase<Entity, Key> : IStore<Entity, Key>
    where Entity : class
{
    protected readonly AppDbContext Db;
    protected readonly DbSet<Entity> Set;

    /// <summary>
    /// Initialize a new store base.
    /// </summary>
    /// <param name="db">The application database context.</param>
    /// <param name="set">The entity set to operate on.</param>
    protected StoreBase(AppDbContext db, DbSet<Entity> set)
    {
        Db = db;
        Set = set;
    }

    /// <inheritdoc />
    public virtual IReadOnlyList<Entity> All()
    {
        return Set.ToList();
    }

    /// <inheritdoc />
    public virtual Entity Create(Entity entity)
    {
        Set.Add(entity);
        return entity;
    }

    /// <inheritdoc />
    public virtual Entity? Find(Key id)
    {
        return Set.Find(id);
    }

    /// <inheritdoc />
    public virtual Entity Update(Entity entity)
    {
        Set.Update(entity);
        return entity;
    }

    /// <inheritdoc />
    public virtual bool Delete(Key id)
    {
        var entity = Find(id);
        if (entity is null)
        {
            return false;
        }

        Set.Remove(entity);
        return true;
    }

    /// <inheritdoc />
    public int Save()
    {
        return Db.SaveChanges();
    }
}
