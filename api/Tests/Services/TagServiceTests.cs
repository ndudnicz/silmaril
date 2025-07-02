using Api.Entities;
using Api.Exceptions;
using Api.Repositories;
using Api.Services;
using FluentAssertions;
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
        _tagRepository.Setup(r => r.GetTagsByNamesAsync(It.IsAny<string[]>())).ReturnsAsync(tags);

        var service = CreateService();
        var result = await service.GetTagsByNamesAsync(new[] { "tag1", "tag2" });

        result.Should().HaveCount(2);
        result.Select(t => t.Name).Should().Contain(new[] { "tag1", "tag2" });
    }
    
    [Fact]
    public async Task GetTagsByNamesAsync_WhenTagNotFound_ShouldThrow()
    {
        _tagRepository.Setup(r => r.GetTagsByNamesAsync(It.IsAny<string[]>())).ReturnsAsync(new List<Tag>());

        var service = CreateService();

        Func<Task> act = async () => await service.GetTagsByNamesAsync(new[] { "tag1", "tag2" });
        
        await act.Should().ThrowAsync<TagsNotFound>();
    }
}