using Api.Exceptions;
using Api.Repositories.Interfaces;
using Api.Services.Validation.Interfaces;

namespace Api.Services.Validation;

public class LoginValidator(ILoginRepository loginRepository) : ILoginValidator
{
    public async Task EnsureExistsByUserIdAsync(Guid id, Guid userId)
    {
        if (!await loginRepository.LoginExistsByUserIdAsync(id, userId))
        {
            throw new LoginNotFound("id", id.ToString());
        }
    }

    public async Task EnsureExistsByUserIdAsync(List<Guid> ids, Guid userId)
    {
        if (!await loginRepository.LoginsExistByUserIdAsync(ids, userId))
        {
            throw new LoginsNotFound("ids", string.Join(", ", ids.Select(x => x.ToString())));
        }
    }
}