using Api.Entities;
using Api.Entities.Dtos;
using Api.Exceptions;
using Api.Mappers.Interfaces;
using Api.Repositories.Interfaces;
using Api.Services;
using Api.Services.Validation.Interfaces;
using Moq;

namespace Tests.Services;

public class VaultServiceTests
{
    private readonly Mock<IVaultRepository> _vaultRepository = new();
    private readonly Mock<IVaultValidator> _vaultValidator = new();
    private readonly Mock<IVaultMapper> _vaultMapper = new();
    private readonly Mock<ICredentialRepository> _credentialRepository = new();

    private VaultService CreateService() => new VaultService(
        _vaultRepository.Object,
        _vaultValidator.Object,
        _vaultMapper.Object,
        _credentialRepository.Object
        );

    private static Vault CreateTestVault(
        Guid id = new(),
        Guid userId = new(),
        string name = "Test Vault"
    )
    {
        return new Vault
        {
            Id = id,
            UserId = userId,
            Name = name,
            Created = DateTime.UtcNow
        };
    }

    private static VaultDto CreateTestVaultDto(Vault vault)
    {
        return new VaultDto
        {
            Id = vault.Id,
            Name = vault.Name,
            Created = vault.Created
        };
    }

    [Fact]
    private async Task GetVaultsByUserIdAsync_ShouldReturnVaults()
    {
        var userId = Guid.NewGuid();
        var vaults = new List<Vault>
        {
            CreateTestVault(Guid.NewGuid(), userId, "Vault 1"),
            CreateTestVault(Guid.NewGuid(), userId, "Vault 2")
        };
        var vaultDtos = vaults.Select(CreateTestVaultDto).ToList();

        _vaultRepository.Setup(r => r.GetByUserIdAsync(userId)).ReturnsAsync(vaults);
        _vaultMapper.Setup(m => m.ToDto(It.IsAny<List<Vault>>())).Returns(vaultDtos);

        var service = CreateService();
        var result = await service.GetByUserIdAsync(userId);

        var expected = vaults.Select(CreateTestVaultDto).OrderBy(v => v.Id).ToList();
        var actual = result.OrderBy(v => v.Id).ToList();
        Assert.Equal(expected.Count, actual.Count);
        for (var i = 0; i < expected.Count; i++)
        {
            Assert.Equal(expected[i].Id, actual[i].Id);
            Assert.Equal(expected[i].Name, actual[i].Name);
            Assert.Equal(expected[i].Created, actual[i].Created);
        }
    }

    [Fact]
    private async Task DeleteVaultAsync_ShouldDeleteVault()
    {
        var userId = Guid.NewGuid();
        var vaultId = Guid.NewGuid();
        var logins = new List<Login>
        {
            CredentialServiceTests.CreateTestLogin(userId, vaultId)
        };
        var updatedLogins = logins.Select(l =>
        {
            l.Deleted = true;
            return l;
        }).ToList();

        _vaultValidator.Setup(v => v.EnsureExistsByUserIdAsync(vaultId, userId)).Returns(Task.CompletedTask);
        _vaultValidator.Setup(v => v.EnsureMultipleVaultsExistAsync(userId)).Returns(Task.CompletedTask);
        _credentialRepository.Setup(r => r.GetByVaultIdWithTagsAsync(vaultId))
            .ReturnsAsync(logins);
        _vaultRepository.Setup(r => r.DeleteAsync(vaultId)).ReturnsAsync(1);
        _credentialRepository.Setup(r => r.UpdateAsync(logins)).ReturnsAsync(updatedLogins);

        var service = CreateService();
        var result = await service.DeleteAsync(vaultId, userId);

        Assert.Equal(1, result);
    }

    [Fact]
    private async Task DeleteVaultAsync_ShouldThrow_WhenVaultDoesNotExist()
    {
        var userId = Guid.NewGuid();
        var invalidVaultId = Guid.NewGuid();

        _vaultValidator.Setup(v => v.EnsureExistsByUserIdAsync(invalidVaultId, userId))
            .ThrowsAsync(new VaultNotFound("id", invalidVaultId.ToString()));

        var service = CreateService();

        Func<Task> act = async () => await service.DeleteAsync(invalidVaultId, userId);

        await Assert.ThrowsAsync<VaultNotFound>(act);
    }

    [Fact]
    private async Task DeleteVaultAsync_ShouldThrow_WhenVaultIsTheLastOne()
    {
        var userId = Guid.NewGuid();
        var vaultId = Guid.NewGuid();

        _vaultValidator.Setup(v => v.EnsureExistsByUserIdAsync(vaultId, userId)).Returns(Task.CompletedTask);
        _vaultValidator.Setup(v => v.EnsureMultipleVaultsExistAsync(userId))
            .ThrowsAsync(new CannotDeleteLastVaultException());

        var service = CreateService();

        Func<Task> act = async () => await service.DeleteAsync(vaultId, userId);

        await Assert.ThrowsAsync<CannotDeleteLastVaultException>(act);
    }
}