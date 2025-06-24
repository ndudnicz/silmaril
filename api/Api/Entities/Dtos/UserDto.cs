namespace Api.Entities.Dtos;

public class UserDto
{
    public required Guid Id { get; set; }
    public required string UsernameHash { get; set; }
    public required byte[] Salt { get; set; }
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
            Salt = user.Salt
        };
    }
}