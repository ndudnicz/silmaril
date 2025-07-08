using Api.Entities;
using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;

namespace Api.Mappers.Interfaces;

public interface ILoginMapper: IMapper<Login, LoginDto, CreateLoginDto>
{
    void FillEntityFromUpdateDto(Login login, UpdateLoginDto dto, List<Tag> tags);
}