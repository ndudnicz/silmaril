using Api.Exceptions;
using Api.Repositories.Interfaces;
using Api.Services.Validation.Interfaces;

namespace Api.Services.Validation;

public class VaultValidator(IVaultRepository vaultRepository) : IVaultValidator
{
    public async Task EnsureExistsByUserIdAsync(Guid id, Guid userId)
    {
        if (!await vaultRepository.ExistsByUserIdAsync(id, userId))
        {
            throw new VaultNotFound("id", id.ToString());
        }
    }

    public async Task EnsureExistsByUserIdAsync(List<Guid> ids, Guid userId)
    {
        if (!await vaultRepository.ExistByUserIdAsync(ids, userId))
        {
            throw new VaultsNotFound("ids", string.Join(", ", ids.Select(x => x.ToString())));
        }
    }

    public async Task EnsureMultipleVaultsExistAsync(Guid userId)
    {
        if (await vaultRepository.CountByUserIdAsync(userId) <= 1)
        {
            throw new CannotDeleteLastVaultException();
        }
    }
}