using Api.Entities;

namespace Api.Services;

public interface ITagService
{
    public Task<Tag> GetTagAsync(int id);
    public Task<Tag> GetTagByNameAsync(string name);
}