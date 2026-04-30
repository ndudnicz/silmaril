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
using Moq;

namespace Tests.Services;

public class CredentialServiceTests
{
    private readonly Mock<ICredentialRepository> _credentialRepository = new();
    private readonly Mock<ITagService> _tagService = new();
    private readonly Mock<IUserValidator> _userValidator = new();
    private readonly Mock<ICredentialValidator> _credentialValidator = new();
    private readonly Mock<IVaultValidator> _vaultValidator = new();
    private readonly ICredentialMapper _credentialMapper = new CredentialMapper();

    private CredentialService CreateService() =>
        new(_credentialRepository.Object,
            _tagService.Object,
            _userValidator.Object,
            _credentialValidator.Object,
            _vaultValidator.Object,
            _credentialMapper);

    public static Login CreateTestLogin(
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

        _tagService.Setup(t => t.GetByNamesAsync(It.IsAny<string[]>()))
            .ReturnsAsync(tags);
        _credentialRepository.Setup(r => r.CreateAsync(It.IsAny<Login>()))
            .ReturnsAsync(login);
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.CreateAsync(createDto, Guid.NewGuid());

        Assert.NotNull(result);
        Assert.Equal(login.Id, result.Id);
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

        _tagService.Setup(t => t.GetAsync()).ReturnsAsync(tags);
        _credentialRepository.Setup(r => r.CreateAsync(It.IsAny<List<Login>>()))
            .ReturnsAsync(logins);
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.CreateAsync(createDtos, userId);

        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        var resultIds = result.Select(l => l.Id).OrderBy(id => id);
        var expectedIds = logins.Select(l => l.Id).OrderBy(id => id);
        Assert.Equal(expectedIds, resultIds);
    }

    [Fact]
    public async Task CreateLoginAsync_WhenTagsNotFound_ShouldThrow()
    {
        var createDto = new CreateLoginDto { VaultId = Guid.Empty, TagNames = new[] { "inexistant" } };
        _tagService.Setup(t => t.GetByNamesAsync(It.IsAny<string[]>()))
            .ThrowsAsync(new TagsNotFound("Name", "inexistant"));
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);
        var service = CreateService();

        Func<Task> act = async () => await service.CreateAsync(createDto, Guid.NewGuid());

        await Assert.ThrowsAsync<TagsNotFound>(act);
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

        _tagService.Setup(t => t.GetAsync())
            .ThrowsAsync(new TagsNotFound("Name", "inexistant, inexistant2"));
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);
        var service = CreateService();

        Func<Task> act = async () => await service.CreateAsync(createDtos, Guid.NewGuid());

        await Assert.ThrowsAsync<TagsNotFound>(act);
    }

    [Fact]
    public async Task UpdateLoginAsync_WhenUserNotFound_ShouldThrow()
    {
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Throws(new UserNotFound("id", Guid.NewGuid().ToString()));
        _credentialValidator.Setup(u => u.EnsureExistsByUserIdAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);
        var service = CreateService();

        Func<Task> act = async () => await service.UpdateAsync(new UpdateLoginDto
        {
            Id = Guid.NewGuid()
        }, Guid.NewGuid());

        await Assert.ThrowsAsync<UserNotFound>(act);
    }

    [Fact]
    public async Task DeleteLoginByUserIdAsync_ShouldReturnCount()
    {
        _credentialRepository.Setup(r => r.DeleteAsync(It.IsAny<Guid>()))
            .ReturnsAsync(1);
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);
        _credentialValidator.Setup(u => u.EnsureExistsByUserIdAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);
        var service = CreateService();

        var result = await service.DeleteAsync(Guid.NewGuid(), Guid.NewGuid());

        Assert.Equal(1, result);
    }

    [Fact]
    public async Task DeleteLoginByUserIdAsync_WhenNoLoginDeleted_ShouldReturnZero()
    {
        _credentialRepository.Setup(r => r.DeleteAsync(It.IsAny<Guid>()))
            .ReturnsAsync(0);
        _userValidator.Setup(u => u.EnsureExistsAsync(It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);
        _credentialValidator.Setup(u => u.EnsureExistsByUserIdAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.DeleteAsync(Guid.NewGuid(), Guid.NewGuid());

        Assert.Equal(0, result);
    }
}
