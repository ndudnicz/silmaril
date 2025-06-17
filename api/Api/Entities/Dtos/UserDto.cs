namespace Api.Entities.Dtos;

public class UserDto
{
    public required Guid Id { get; set; }
    public required string Username { get; set; }
    public required byte[] Salt { get; set; }
    public required DateTime Created { get; set; }
    public required DateTime? Updated { get; set; }

    public static UserDto FromUser(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Created = user.Created,
            Updated = user.Updated,
            Salt = user.Salt
        };
    }
}