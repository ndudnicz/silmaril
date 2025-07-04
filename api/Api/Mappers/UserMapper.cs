using Api.Entities;
using Api.Entities.Dtos;
using Api.Mappers.Interfaces;

namespace Api.Mappers;

public class UserMapper : IUserMapper
{
    public UserDto ToDto(User user)
    {
        return new UserDto(user.Id, user.Created, user.Updated, user.UsernameHash, user.Salt);
    }

    public List<UserDto> ToDto(List<User> users)
    {
        return users.Select(ToDto).ToList();
    }
}