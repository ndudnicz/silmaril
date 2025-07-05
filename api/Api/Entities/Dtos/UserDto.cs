namespace Api.Entities.Dtos;

public class UserDto: MyEntity
{
    public required string UsernameHash { get; set; }
    public required byte[] Salt { get; set; }
    public string SaltBase64 => Convert.ToBase64String(Salt);
}