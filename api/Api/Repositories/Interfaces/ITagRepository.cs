using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface ITagRepository
{
    Task<List<Tag>> GetTagsAsync();
    
    Task<List<Tag>> GetTagsByNamesAsync(string[] names);
}