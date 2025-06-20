using Api.Entities;
using Api.Entities.Dtos;

namespace Api.Services;

public interface ILoginService
{
    // public Task<Login> GetLoginAsync(Guid id);
    public Task<LoginDto> GetLoginByUserIdAsync(Guid id, Guid userId);
    public Task<IEnumerable<LoginDto>> GetLoginsByUserIdAsync(Guid userId);
    public Task<LoginDto> CreateLoginAsync(CreateLoginDto createLoginDto);
    public Task<LoginDto> AddTagToLoginAsync(Guid id, string tagName);
    public Task<LoginDto> UpdateLoginAsync(UpdateLoginDto updateLoginDto);
}