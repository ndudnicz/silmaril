using Api.Entities;
using Api.Exceptions;
using Api.Repositories.Interfaces;
using Api.Services;
using Moq;

namespace Tests.Services;

public class TagServiceTests
{
    private readonly Mock<ITagRepository> _tagRepository = new();
    private TagService CreateService() => new(_tagRepository.Object);

    [Fact]
    public async Task GetTagsByNamesAsync_ShouldReturnTags()
    {
        var tags = new List<Tag> { new() { Name = "tag1" }, new() { Name = "tag2" } };
        _tagRepository.Setup(r => r.GetByNamesAsync(It.IsAny<string[]>())).ReturnsAsync(tags);

        var service = CreateService();
        var result = await service.GetByNamesAsync(new[] { "tag1", "tag2" });

        Assert.Equal(2, result.Count);
        Assert.Contains("tag1", result.Select(t => t.Name));
        Assert.Contains("tag2", result.Select(t => t.Name));
    }

    [Fact]
    public async Task GetTagsByNamesAsync_WhenTagNotFound_ShouldThrow()
    {
        _tagRepository.Setup(r => r.GetByNamesAsync(It.IsAny<string[]>())).ReturnsAsync([]);

        var service = CreateService();

        Func<Task> act = async () => await service.GetByNamesAsync(new[] { "tag1", "tag2" });

        await Assert.ThrowsAsync<TagsNotFound>(act);
    }
}