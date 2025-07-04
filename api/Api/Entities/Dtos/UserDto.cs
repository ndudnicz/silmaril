namespace Api.Entities.Dtos;

public class UserDto: MyEntity
{
    public string UsernameHash { get; set; }
    private byte[] Salt { get; set; }
    public string SaltBase64 => Convert.ToBase64String(Salt);
    
    public UserDto(
        Guid id,
        DateTime created,
        DateTime? updated,
        string usernameHash,
        byte[] salt
    )
    {
        Id = id;
        Created = created;
        Updated = updated;
        UsernameHash = usernameHash;
        Salt = salt;
    }
}