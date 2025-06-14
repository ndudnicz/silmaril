using Api.Entities;

namespace Api.Repositories;

public interface ITagRepository
{
    public Task<Tag?> GetTagAsync(int id);
    public Task<Tag?> GetTagByNameAsync(string name);
}