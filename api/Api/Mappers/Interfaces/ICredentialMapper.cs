using Api.Entities;
using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;

namespace Api.Mappers.Interfaces;

public interface ICredentialMapper : IMapper<Credential, CredentialDto, CreateCredentialDto>
{
    void FillEntityFromUpdateDto(Credential credential, UpdateCredentialDto dto, List<Tag> tags);
}