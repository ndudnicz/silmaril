using Api.Entities;
using Api.Entities.Dtos;
using Api.Mappers.Interfaces;

namespace Api.Mappers;

public class UserMapper : IUserMapper
{
    public UserDto ToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Created = user.Created,
            Updated = user.Updated,
            UsernameHash = user.UsernameHash!,
            Salt = user.Salt!
        };
    }

    public List<UserDto> ToDto(List<User> users)
    {
        return users.Select(ToDto).ToList();
    }
}