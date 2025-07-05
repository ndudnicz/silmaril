namespace Api.Services.Validation.Interfaces;

public interface ILoginValidator
{
    Task EnsureExistsByUserIdAsync(Guid id, Guid userId);
    Task EnsureExistsByUserIdAsync(List<Guid> ids, Guid userId);
}