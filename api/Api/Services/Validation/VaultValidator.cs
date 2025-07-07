using Api.Exceptions;
using Api.Repositories.Interfaces;
using Api.Services.Validation.Interfaces;

namespace Api.Services.Validation;

public class VaultValidator(IVaultRepository vaultRepository) : IVaultValidator
{
    public async Task EnsureExistsByUserIdAsync(Guid? id, Guid userId)
    {
        if (id.HasValue && !await vaultRepository.VaultExistsByUserIdAsync(id.Value, userId))
        {
            throw new VaultNotFound("id", id.Value.ToString());
        }
    }

    public async Task EnsureExistsByUserIdAsync(List<Guid?> ids, Guid userId)
    {
        var values = ids.Where(id => id.HasValue).Select(id => id!.Value);
        if (!await vaultRepository.VaultExistByUserIdAsync(values, userId))
        {
            throw new VaultsNotFound("ids", string.Join(", ", ids.Select(x => x.ToString())));
        }
    }
}