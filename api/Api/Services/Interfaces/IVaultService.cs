using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;

namespace Api.Services.Interfaces;

public interface IVaultService
{
    Task<List<VaultDto>> GetByUserIdAsync(Guid userId);
    Task<VaultDto> CreateAsync(CreateVaultDto createVaultDto, Guid userId);
    Task<VaultDto> CreateUserDefaultFirstVaultAsync(Guid userId);
    Task<VaultDto> UpdateAsync(UpdateVaultDto updateVaultDto, Guid userId);
    Task<int> DeleteAsync(Guid id, Guid userId);
}