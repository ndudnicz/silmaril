namespace Api.Entities.Dtos;

public class UserDto: MyEntity
{
    private byte[] Salt { get; init; }
    public string SaltBase64 => Convert.ToBase64String(Salt);
    
    public UserDto(byte[] salt)
    {
        Salt = salt;
    }
}