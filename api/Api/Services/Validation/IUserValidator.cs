namespace Api.Services.Validation;

public interface IUserValidator
{
    public Task EnsureExistsAsync(Guid id);
    public Task EnsureExistsByUsernameHashAsync(string usernameHash);
}