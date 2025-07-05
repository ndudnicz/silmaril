namespace Api.Entities.Dtos.Create;

public record CreateLoginDto
{
    public required Guid VaultId { get; set; }
    public string? EncryptedDataBase64 { get; set; }
    public string[] TagNames { get; set; } = [];
    public int? EncryptionVersion { get; set; }
    public string? InitializationVectorBase64 { get; set; }
}