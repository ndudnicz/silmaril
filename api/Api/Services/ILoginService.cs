using Api.Entities;
using Api.Entities.Dtos;

namespace Api.Services;

public interface ILoginService
{
    public Task<LoginDto> GetLoginByUserIdAsync(Guid id, Guid userId);
    public Task<List<LoginDto>> GetLoginsByUserIdAsync(Guid userId);
    public Task<LoginDto> CreateLoginAsync(CreateLoginDto createLoginDto, Guid userId);
    public Task<LoginDto> AddTagToLoginAsync(Guid id, string tagName);
    public Task<LoginDto> UpdateLoginAsync(UpdateLoginDto updateLoginDto, Guid userId);
    public Task<List<LoginDto>> UpdateLoginBulkAsync(List<UpdateLoginDto> updateLoginDtos, Guid userId);

    public Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId);
}