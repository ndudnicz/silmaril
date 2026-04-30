using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface ITagRepository
{
    Task<List<Tag>> GetAsync();

    Task<List<Tag>> GetByNamesAsync(string[] names);
}