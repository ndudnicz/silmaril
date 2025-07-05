namespace Api.Entities.Dtos.Update;

public record UpdateLoginDto
{
    public required Guid Id { get; set; }
    public string? EncryptedDataBase64 { get; set; }
    public string? InitializationVectorBase64 { get; set; }
    public string[] TagNames { get; set; } = [];
    public int? EncryptionVersion { get; set; }
    public bool Deleted { get; set; }
    public Guid VaultId { get; set; }
}