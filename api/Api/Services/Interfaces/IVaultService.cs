using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;

namespace Api.Services.Interfaces;

public interface IVaultService
{
    // Task<VaultDto> GetVaultByIdAndUserIdAsync(Guid id, Guid userId);
    Task<List<VaultDto>> GetVaultsByUserIdAsync(Guid userId);
    Task<VaultDto> CreateVaultAsync(CreateVaultDto createVaultDto, Guid userId);
    Task<VaultDto> CreateUserDefaultFirstVaultAsync(Guid userId);
    Task<VaultDto> UpdateVaultAsync(UpdateVaultDto updateVaultDto, Guid userId);
    Task<int> DeleteVaultAsync(Guid id, Guid userId);
}