using Api.Entities;

namespace Api.Services;

public interface ITagService
{
    public Task<List<Tag>> GetTagsAsync();
    public Task<Tag> GetTagAsync(Guid id);
    public Task<Tag> GetTagByNameAsync(string name);
    public Task<List<Tag>> GetTagByNameBulkAsync(string[] names);
}