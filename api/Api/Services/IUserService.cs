using Api.Entities;
using Api.Entities.Dtos;

namespace Api.Services;

public interface IUserService
{
    public Task<User> GetUserByUserNameAsync(string username);
    public Task<User> GetUserAsync(Guid id);
    public Task<User> CreateUserAsync(CreateUserDto createUserDto);
    public Task<User> UpdateUserAsync(UpdateUserDto updateUserDto);
    public Task<User> UpdateUserPasswordAsync(UpdateUserPasswordDto updateUserPasswordDto);
}