using Api.Entities;
using Api.Entities.Dtos;
using Api.Mappers.Interfaces;

namespace Api.Mappers;

public class VaultMapper : IVaultMapper
{
    public VaultDto ToDto(Vault vault)
    {
        return new VaultDto
        {
            Name = vault.Name
        };
    }

    public List<VaultDto> ToDto(List<Vault> vaults)
    {
        return vaults.Select(ToDto).ToList();
    }

    public void FillEntityFromUpdateDto(Vault vault, UpdateVaultDto dto)
    {
        vault.Name = dto.Name;
    }

    public Vault ToEntity(CreateVaultDto dto)
    {
        return new Vault
        {
            Name = dto.Name
        };
    }

    public List<Vault> ToEntity(List<CreateVaultDto> dtos)
    {
        return dtos.Select(ToEntity).ToList();
    }
}