namespace Api.Services.Validation.Interfaces;

public interface IUserValidator
{
    Task EnsureExistsAsync(Guid id);
    Task EnsureExistsByUsernameHashAsync(string usernameHash);
    Task EnsureDoesNotExistByUsernameHashAsync(string usernameHash);

}