using Api.Entities;
using Api.Entities.Dtos;

namespace Api.Mappers.Interfaces;

public interface IUserMapper
{
    UserDto ToDto(User user);
    List<UserDto> ToDto(List<User> users);
}