namespace Api.Entities.Dtos;

public class UserDto: MyEntity
{
    public required string UsernameHash { get; set; }
    public required string SaltBase64 { get; set; }

    public static UserDto FromUser(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            UsernameHash = user.UsernameHash,
            Created = user.Created,
            Updated = user.Updated,
            SaltBase64 = Convert.ToBase64String(user.Salt)
        };
    }
}