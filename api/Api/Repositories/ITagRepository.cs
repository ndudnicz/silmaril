using Api.Entities;

namespace Api.Repositories;

public interface ITagRepository
{
    public Task<List<Tag>> GetTagsAsync();
    
    public Task<List<Tag>> GetTagsByNamesAsync(string[] names);
}