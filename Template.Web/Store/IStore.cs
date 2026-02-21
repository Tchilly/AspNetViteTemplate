namespace Template.Web.Store;

/// <summary>
/// Generic store contract for common CRUD-style verbs.
/// </summary>
/// <typeparam name="Entity">The resource type managed by the store.</typeparam>
/// <typeparam name="Key">The identifier type used to locate a resource.</typeparam>
public interface IStore<Entity, in Key>
    where Entity : class
{
    /// <summary>
    /// Display a listing of the resource.
    /// </summary>
    /// <returns>A read-only list of resources.</returns>
    IReadOnlyList<Entity> All();

    /// <summary>
    /// Store a newly created resource in storage.
    /// </summary>
    /// <param name="entity">The resource to create.</param>
    /// <returns>The created resource.</returns>
    Entity Create(Entity entity);

    /// <summary>
    /// Retrieve the specified resource.
    /// </summary>
    /// <param name="id">The resource id.</param>
    /// <returns>The resource when found; otherwise null.</returns>
    Entity? Find(Key id);

    /// <summary>
    /// Update the specified resource in storage.
    /// </summary>
    /// <param name="entity">The resource to update.</param>
    /// <returns>The updated resource.</returns>
    Entity Update(Entity entity);

    /// <summary>
    /// Remove the specified resource from storage.
    /// </summary>
    /// <param name="id">The resource id.</param>
    /// <returns>True when deleted; otherwise false.</returns>
    bool Delete(Key id);

    /// <summary>
    /// Persist all staged changes.
    /// </summary>
    /// <returns>The number of affected rows.</returns>
    int Save();
}
