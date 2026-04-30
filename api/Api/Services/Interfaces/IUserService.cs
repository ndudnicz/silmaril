using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;

namespace Api.Services.Interfaces;

public interface IUserService
{
    Task<UserDto> GetByUserNameAsync(string username);
    Task<UserDto> GetAsync(Guid id);
    Task<UserDto> CreateAsync(CreateUserDto createUserDto);
    Task<UserDto> UpdateAsync(Guid userId, UpdateUserDto updateUserDto);
    Task<UserDto> UpdatePasswordAsync(Guid userId, UpdateUserPasswordDto updateUserPasswordDto);
}