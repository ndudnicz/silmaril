namespace Api.Services.Validation.Interfaces;

public interface IVaultValidator
{
    public Task EnsureExistsByUserIdAsync(Guid id, Guid userId);
    public Task EnsureExistsByUserIdAsync(IEnumerable<Guid> ids, Guid userId);
}