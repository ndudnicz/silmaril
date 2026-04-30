using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;

namespace Api.Services.Interfaces;

public interface ICredentialService
{
    Task<List<LoginDto>> GetByUserIdAsync(Guid userId);
    Task<List<LoginDto>> GetDeletedByUserIdAsync(Guid userId);

    Task<LoginDto> CreateAsync(CreateLoginDto createCredentialDto, Guid userId);
    Task<List<LoginDto>> CreateAsync(List<CreateLoginDto> createLoginDtos, Guid userId);

    Task<LoginDto> UpdateAsync(UpdateLoginDto updateCredentialDto, Guid userId);
    Task<List<LoginDto>> UpdateAsync(List<UpdateLoginDto> updateLoginDtos, Guid userId);

    Task<int> DeleteAsync(Guid id, Guid userId);
    Task<int> DeleteAsync(List<Guid> ids, Guid userId);
}