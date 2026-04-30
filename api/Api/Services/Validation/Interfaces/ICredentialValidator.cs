namespace Api.Services.Validation.Interfaces;

public interface ICredentialValidator
{
    Task EnsureExistsByUserIdAsync(Guid id, Guid userId);
    Task EnsureExistsByUserIdAsync(List<Guid> ids, Guid userId);
}