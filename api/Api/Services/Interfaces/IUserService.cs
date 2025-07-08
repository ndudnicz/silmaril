using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;

namespace Api.Services.Interfaces;

public interface IUserService
{
    Task<UserDto> GetUserByUserNameAsync(string username);
    Task<UserDto> GetUserAsync(Guid id);
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
    Task<UserDto> UpdateUserAsync(Guid userId, UpdateUserDto updateUserDto);
    Task<UserDto> UpdateUserPasswordAsync(Guid userId, UpdateUserPasswordDto updateUserPasswordDto);
}