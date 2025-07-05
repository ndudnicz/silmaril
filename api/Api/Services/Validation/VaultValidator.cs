using Api.Exceptions;
using Api.Repositories.Interfaces;
using Api.Services.Validation.Interfaces;

namespace Api.Services.Validation;

public class VaultValidator(IVaultRepository vaultRepository) : IVaultValidator
{
    public async Task EnsureExistsByUserIdAsync(Guid id, Guid userId)
    {
        if (!await vaultRepository.VaultExistsByUserIdAsync(id, userId))
        {
            throw new LoginNotFound("id", id.ToString());
        }
    }

    public async Task EnsureExistsByUserIdAsync(IEnumerable<Guid> ids, Guid userId)
    {
        if (!await vaultRepository.VaultExistByUserIdAsync(ids, userId))
        {
            throw new LoginsNotFound("ids", string.Join(", ", ids.Select(x => x.ToString())));
        }
    }
}