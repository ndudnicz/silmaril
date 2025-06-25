using Api.Helpers;

namespace Api.Entities.Dtos;

public class UserDto
{
    public required Guid Id { get; set; }
    public required string UsernameHash { get; set; }
    public required string SaltBase64 { get; set; }
    public required DateTime Created { get; set; }
    public required DateTime? Updated { get; set; }

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