namespace Api.Entities.Dtos;

public class UserDto(byte[] salt) : MyEntity
{
    private byte[] Salt { get; init; } = salt;
    public string SaltBase64 => Convert.ToBase64String(Salt);
}