using Api.Entities;

namespace Api.Repositories;

public interface ITagRepository
{
    public Task<Tag> GetTagAsync(Guid id);
    public Task<List<Tag>> GetTagByIdBulkAsync(Guid[] ids);

    public Task<Tag> GetTagByNameAsync(string name);
    public Task<List<Tag>> GetTagByNameBulkAsync(string[] names);
}