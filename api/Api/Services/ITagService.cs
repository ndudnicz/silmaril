using Api.Entities;

namespace Api.Services;

public interface ITagService
{
    public Task<Tag> GetTagAsync(Guid id);
    public Task<Tag> GetTagByNameAsync(string name);
    public Task<List<Tag>> GetTagByNameBulkAsync(string[] names);
}