namespace Api.Services.Validation.Interfaces;

public interface IUserValidator
{
    public Task EnsureExistsAsync(Guid id);
    public Task EnsureDoesNotExist(Guid id);
    public Task EnsureExistsByUsernameHashAsync(string usernameHash);
    public Task EnsureDoesNotExistByUsernameHashAsync(string usernameHash);

}