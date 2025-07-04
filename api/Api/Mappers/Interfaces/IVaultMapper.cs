using Api.Entities;
using Api.Entities.Dtos;

namespace Api.Mappers.Interfaces;

public interface IVaultMapper: IMapper<Vault, VaultDto, CreateVaultDto>
{
    void FillEntityFromUpdateDto(Vault vault, UpdateVaultDto dto);
}