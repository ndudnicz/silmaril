using Api.Entities.Dtos;

namespace Api.Services;

public interface ILoginService
{
    public Task<List<LoginDto>> GetLoginsByUserIdAsync(Guid userId);
    public Task<LoginDto> CreateLoginAsync(CreateLoginDto createLoginDto, Guid userId);
    public Task<LoginDto> UpdateLoginAsync(UpdateLoginDto updateLoginDto, Guid userId);
    public Task<List<LoginDto>> UpdateLoginsAsync(List<UpdateLoginDto> updateLoginDtos, Guid userId);

    public Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId);
}