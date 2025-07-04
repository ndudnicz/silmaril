using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface ITagRepository
{
    public Task<List<Tag>> GetTagsAsync();
    
    public Task<List<Tag>> GetTagsByNamesAsync(string[] names);
}