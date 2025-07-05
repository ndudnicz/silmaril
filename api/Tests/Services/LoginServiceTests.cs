using Api.Entities;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;
using Api.Exceptions;
using Api.Mappers;
using Api.Mappers.Interfaces;
using Api.Repositories.Interfaces;
using Api.Services;
using Api.Services.Interfaces;
using Api.Services.Validation.Interfaces;
using FluentAssertions;
using Moq;

namespace Tests.Services;

public class LoginServiceTests
{
    private readonly Mock<ILoginRepository> _loginRepository = new();
    private readonly Mock<ITagService> _tagService = new();
    private readonly Mock<IUserValidator> _userValidator = new();
    private readonly Mock<ILoginValidator> _loginValidator = new();
    private readonly Mock<IVaultValidator> _vaultValidator = new();
    private readonly ILoginMapper _loginMapper = new LoginMapper();

    private LoginService CreateService() =>
        new(_loginRepository.Object,
            _tagService.Object,
            _userValidator.Object,
            _loginValidator.Object,
            _vaultValidator.Object,
            _loginMapper);

    private static Login CreateTestLogin(
        Guid userId = new(),
        Guid vaultId = new(),
        List<Tag>? tags = null,
        bool deleted = false,
        int encryptionVersion = 1
        )
    {
        return new Login
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Tags = tags ?? [],
            Deleted = deleted,
            EncryptedData = new byte[3],
            EncryptionVersion = encryptionVersion,
            InitializationVector = new byte[16],
            Created = DateTime.UtcNow,
            VaultId = vaultId
        };
    }

    [Fact]
    public async Task CreateLoginAsync_WithTags_ShouldReturnLoginDto()
    {
        var tags = new List<Tag> { new() { Name = "tag1" } };
        var vaultId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var createDto = new CreateLoginDto { VaultId = vaultId, TagNames = new[] { tags[0].Name } };
        var login = CreateTestLogin(userId, vaultId, tags);
        _tagService.Setup(t => t.GetTagsByNamesAsync(It.IsAny<string[]>()))
            .ReturnsAsync(tags);
        _loginRepository.Setup(r => r.CreateLoginAsync(It.IsAny<Login>()))
            .ReturnsAsync(login);
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);
        
        var service = CreateService();
        var result = await service.CreateLoginAsync(createDto, Guid.NewGuid());

        result.Should().NotBeNull();
        result.Id.Should().Be(login.Id);
    }

    [Fact]
    public async Task UpdateLoginAsync_WhenUserNotFound_ShouldThrow()
    {
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Throws(new UserNotFound("id", Guid.NewGuid().ToString()));
        _loginValidator.Setup(u => u.EnsureExistsByUserIdAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        Func<Task> act = async () => await service.UpdateLoginAsync(new UpdateLoginDto(), Guid.NewGuid());

        await act.Should().ThrowAsync<UserNotFound>();
    }

    [Fact]
    public async Task DeleteLoginByUserIdAsync_ShouldReturnCount()
    {
        _loginRepository.Setup(r => r.DeleteLoginByUserIdAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(1);
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.DeleteLoginByUserIdAsync(Guid.NewGuid(), Guid.NewGuid());

        result.Should().Be(1);
    }
    
    [Fact]
    public async Task CreateLoginAsync_WhenTagsNotFound_ShouldThrow()
    {
        var createDto = new CreateLoginDto { VaultId = Guid.Empty, TagNames = new[] { "inexistant" } };
        _tagService.Setup(t => t.GetTagsByNamesAsync(It.IsAny<string[]>()))
            .ThrowsAsync(new TagsNotFound("Name", "inexistant"));
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);
        var service = CreateService();
        Func<Task> act = async () => await service.CreateLoginAsync(createDto, Guid.NewGuid());

        await act.Should().ThrowAsync<TagsNotFound>();
    }
    
    [Fact]
    public async Task DeleteLoginByUserIdAsync_WhenNoLoginDeleted_ShouldReturnZero()
    {
        _loginRepository.Setup(r => r.DeleteLoginByUserIdAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(0);
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.DeleteLoginByUserIdAsync(Guid.NewGuid(), Guid.NewGuid());

        result.Should().Be(0);
    }
    
    [Fact]
    public async Task CreateLoginsAsync_ShouldReturnLoginDtos()
    {
        var userId = Guid.NewGuid();
        var vaultId = Guid.NewGuid();
        var createDtos = new List<CreateLoginDto>
        {
            new() { VaultId = vaultId, TagNames = new[] { "tag1" } },
            new() { VaultId = vaultId, TagNames = new[] { "tag2" } }
        };

        var tags = new List<Tag>
        {
            new() { Name = "tag1" },
            new() { Name = "tag2" }
        };

        var logins = new List<Login>
        {
            CreateTestLogin(userId, vaultId, tags: new List<Tag> { tags[0] }),
            CreateTestLogin(userId, vaultId, tags: new List<Tag> { tags[1] })
        };
        
        _tagService.Setup(t => t.GetTagsAsync()).ReturnsAsync(tags);

        _loginRepository.Setup(r => r.CreateLoginsAsync(It.IsAny<List<Login>>()))
            .ReturnsAsync(logins);
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.CreateLoginsAsync(createDtos, userId);

        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Select(l => l.Id).Should().BeEquivalentTo(logins.Select(l => l.Id));
    }
    
    
    [Fact]
    public async Task CreateLoginsAsync_WhenTagsNotFound_ShouldThrow()
    {
        var vaultId = Guid.NewGuid();
        var createDtos = new List<CreateLoginDto>
        {
            new() { VaultId = vaultId, TagNames = new[] { "inexistant" } },
            new() { VaultId = vaultId, TagNames = new[] { "inexistant2" } }
        };
        _tagService.Setup(t => t.GetTagsAsync())
            .ThrowsAsync(new TagsNotFound("Name", "inexistant, inexistant2"));
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        Func<Task> act = async () => await service.CreateLoginsAsync(createDtos, Guid.NewGuid());

        await act.Should().ThrowAsync<TagsNotFound>();
    }

    [Fact]
    public async Task GetDeletedLoginsByUserIdAsync_ShouldReturnOnlyDeletedLogins()
    {
        var userId = Guid.NewGuid();
        var tags = new List<Tag>();
        var vaultId = Guid.NewGuid();
        var logins = new List<Login>
        {
            CreateTestLogin(userId, vaultId, tags),
            CreateTestLogin(userId, vaultId, tags, true),
            CreateTestLogin(userId, vaultId, tags, true)
        };
        var deletedLogins = logins.Where(l => l.Deleted).ToList();

        _loginRepository
            .Setup(r => r.GetLoginsByUserIdWithTagsAsync(userId, true))
            .ReturnsAsync(deletedLogins);
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.GetDeletedLoginsByUserIdAsync(userId);

        result.Should().NotBeNull();
        result.Should().OnlyContain(l => l.Deleted == true);
        result.Should().HaveCount(deletedLogins.Count);
    }
    
    [Fact]
    public async Task GetNotDeletedLoginsByUserIdAsync_ShouldReturnOnlyNotDeletedLogins()
    {
        var userId = Guid.NewGuid();
        var tags = new List<Tag>();
        var vaultId = Guid.NewGuid();
        var logins = new List<Login>
        {
            CreateTestLogin(userId, vaultId, tags),
            CreateTestLogin(userId, vaultId, tags),
            CreateTestLogin(userId, vaultId, tags, true)
        };
        var notDeletedLogins = logins.Where(l => l.Deleted == false).ToList();
        _loginRepository
            .Setup(r => r.GetLoginsByUserIdWithTagsAsync(userId, false))
            .ReturnsAsync(notDeletedLogins);
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.GetLoginsByUserIdAsync(userId);

        result.Should().NotBeNull();
        result.Should().OnlyContain(l => l.Deleted == false);
        result.Should().HaveCount(notDeletedLogins.Count);
    }
}
