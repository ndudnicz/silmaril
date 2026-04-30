using Api.Exceptions;
using Api.Repositories.Interfaces;
using Api.Services.Validation.Interfaces;

namespace Api.Services.Validation;

public class CredentialValidator(ICredentialRepository credentialRepository) : ICredentialValidator
{
    public async Task EnsureExistsByUserIdAsync(Guid id, Guid userId)
    {
        if (!await credentialRepository.ExistsByUserIdAsync(id, userId))
        {
            throw new LoginNotFound("id", id.ToString());
        }
    }

    public async Task EnsureExistsByUserIdAsync(List<Guid> ids, Guid userId)
    {
        if (!await credentialRepository.ExistByUserIdAsync(ids, userId))
        {
            throw new LoginsNotFound("ids", string.Join(", ", ids.Select(x => x.ToString())));
        }
    }
}