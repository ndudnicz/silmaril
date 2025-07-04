namespace Api.Mappers.Interfaces;

public interface IMapper<T, TDto, TCreateDto>
{
    TDto ToDto(T entity);
    List<TDto> ToDto(List<T> entities);
    T ToEntity(TCreateDto dto);
    List<T> ToEntity(List<TCreateDto> dtos);
}