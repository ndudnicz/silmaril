using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;

namespace Api.Services.Interfaces;

public interface ILoginService
{
    Task<List<LoginDto>> GetLoginsByUserIdAsync(Guid userId);
    Task<LoginDto> CreateLoginAsync(CreateLoginDto createLoginDto, Guid userId);
    Task<List<LoginDto>> CreateLoginsAsync(List<CreateLoginDto> createLoginDtos, Guid userId);
    Task<LoginDto> UpdateLoginAsync(UpdateLoginDto updateLoginDto, Guid userId);
    Task<List<LoginDto>> UpdateLoginsAsync(List<UpdateLoginDto> updateLoginDtos, Guid userId);
    Task<int> DeleteLoginByUserIdAsync(Guid id, Guid userId);
    Task<int> DeleteLoginsByUserIdAsync(List<Guid> ids, Guid userId);
}