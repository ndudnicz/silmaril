namespace Api.Services.Validation;

public interface ILoginValidator
{
    public Task EnsureExistsByUserIdAsync(Guid id, Guid userId);
    public Task EnsureExistsByUserIdAsync(List<Guid> ids, Guid userId);
}