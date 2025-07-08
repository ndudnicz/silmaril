using Api.Helpers;

namespace Api.Entities.Dtos.Update;

public record UpdateUserDto
{
    public required string Username { get; set; }
    public string UsernameHash => CryptoHelper.Sha512(Username);
}