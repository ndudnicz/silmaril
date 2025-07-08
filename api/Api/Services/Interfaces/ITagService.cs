using Api.Entities;

namespace Api.Services.Interfaces;

public interface ITagService
{
    Task<List<Tag>> GetTagsAsync();
    Task<List<Tag>> GetTagsByNamesAsync(string[] names);
    void EnsureAllTagNamesExist(string[] names, List<Tag> tags);
}