using Api.Entities;
using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;

namespace Api.Mappers.Interfaces;

public interface IVaultMapper: IMapper<Vault, VaultDto, CreateVaultDto>
{
    void FillEntityFromUpdateDto(Vault vault, UpdateVaultDto dto);
}