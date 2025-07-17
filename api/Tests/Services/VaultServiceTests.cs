using Api.Entities;
using Api.Entities.Dtos;
using Api.Exceptions;
using Api.Mappers.Interfaces;
using Api.Repositories.Interfaces;
using Api.Services;
using Api.Services.Validation.Interfaces;
using FluentAssertions;
using Moq;

namespace Tests.Services;

public class VaultServiceTests
{
    private readonly Mock<IVaultRepository> _vaultRepository = new();
    private readonly Mock<IVaultValidator> _vaultValidator = new();
    private readonly Mock<IVaultMapper> _vaultMapper = new();

    private VaultService CreateService() => new VaultService(
        _vaultRepository.Object,
        _vaultValidator.Object,
        _vaultMapper.Object
        );
    
    private Vault CreateVaultTest(
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
    
    private VaultDto CreateVaultDtoTest(
        Guid id = new(),
        string name = "Test Vault"
        )
    {
        return new VaultDto
        {
            Id = id,
            Name = name
        };
    }

    private VaultDto CreateVaultDtoTest(Vault vault)
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
            CreateVaultTest(Guid.NewGuid(), userId, "Vault 1"),
            CreateVaultTest(Guid.NewGuid(), userId, "Vault 2")
        };
        var vaultDtos = vaults.Select(CreateVaultDtoTest).ToList();
        
        _vaultRepository.Setup(r => r.GetVaultsByUserIdAsync(userId)).ReturnsAsync(vaults);
        _vaultMapper.Setup(m => m.ToDto(It.IsAny<List<Vault>>())).Returns(vaultDtos);

        var service = CreateService();
        var result = await service.GetVaultsByUserIdAsync(userId);
        
        result.Should().BeEquivalentTo(vaults.Select(CreateVaultDtoTest));
    }
    
    [Fact]
    private async Task DeleteVaultAsync_ShouldDeleteVault()
    {
        var userId = Guid.NewGuid();
        var vaultId = Guid.NewGuid();
        
        _vaultValidator.Setup(v => v.EnsureExistsByUserIdAsync(vaultId, userId)).Returns(Task.CompletedTask);
        _vaultValidator.Setup(v => v.EnsureMultipleVaultsExistAsync(userId)).Returns(Task.CompletedTask);
        _vaultRepository.Setup(r => r.DeleteVaultAsync(vaultId)).ReturnsAsync(1);

        var service = CreateService();
        var result = await service.DeleteVaultAsync(vaultId, userId);
        
        result.Should().Be(1);
    }
    
    [Fact]
    private async Task DeleteVaultAsync_ShouldThrow_WhenVaultDoesNotExist()
    {
        var userId = Guid.NewGuid();
        var invalidVaultId = Guid.NewGuid();
        
        _vaultValidator.Setup(v => v.EnsureExistsByUserIdAsync(invalidVaultId, userId))
            .ThrowsAsync(new VaultNotFound("id", invalidVaultId.ToString()));

        var service = CreateService();
        
        Func<Task> act = async () => await service.DeleteVaultAsync(invalidVaultId, userId);
        
        await act.Should().ThrowAsync<VaultNotFound>();
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
        
        Func<Task> act = async () => await service.DeleteVaultAsync(vaultId, userId);
        
        await act.Should().ThrowAsync<CannotDeleteLastVaultException>();
    }
}