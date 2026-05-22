using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;

namespace Api.Services.Interfaces;

public interface ICredentialService
{
    Task<List<CredentialDto>> GetByUserIdAsync(Guid userId);
    Task<List<CredentialDto>> GetDeletedByUserIdAsync(Guid userId);

    Task<CredentialDto> CreateAsync(CreateCredentialDto createCredentialDto, Guid userId);
    Task<List<CredentialDto>> CreateAsync(List<CreateCredentialDto> createLoginDtos, Guid userId);

    Task<CredentialDto> UpdateAsync(UpdateCredentialDto updateCredentialDto, Guid userId);
    Task<List<CredentialDto>> UpdateAsync(List<UpdateCredentialDto> updateLoginDtos, Guid userId);

    Task<int> DeleteAsync(Guid id, Guid userId);
    Task<int> DeleteAsync(List<Guid> ids, Guid userId);
}