using Api.Entities;

namespace Api.Services.Interfaces;

public interface ITagService
{
    Task<List<Tag>> GetAsync();
    Task<List<Tag>> GetByNamesAsync(string[] names);
    void EnsureAllTagNamesExist(string[] names, List<Tag> tags);
}