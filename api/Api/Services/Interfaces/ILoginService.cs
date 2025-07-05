using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;

namespace Api.Services.Interfaces;

public interface ILoginService
{
    public Task<List<LoginDto>> GetLoginsByUserIdAsync(Guid userId);
    public Task<List<LoginDto>> GetDeletedLoginsByUserIdAsync(Guid userId);
    public Task<List<LoginDto>> GetLoginsByUserIdAndVaultIdAsync(Guid userId, Guid vaultId);
    public Task<LoginDto> CreateLoginAsync(CreateLoginDto createLoginDto, Guid userId);
    public Task<List<LoginDto>> CreateLoginsAsync(List<CreateLoginDto> createLoginDtos, Guid userId);
    public Task<LoginDto> UpdateLoginAsync(UpdateLoginDto updateLoginDto, Guid userId);
    public Task<List<LoginDto>> UpdateLoginsAsync(List<UpdateLoginDto> updateLoginDtos, Guid userId);
    public Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId);
    public Task<int> DeleteLoginsByUserIdAsync(List<Guid> ids, Guid userId);
}