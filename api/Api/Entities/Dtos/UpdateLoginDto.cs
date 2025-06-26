namespace Api.Entities.Dtos;

public record UpdateLoginDto
{
    public Guid Id { get; set; }
    public string? EncryptedDataBase64 { get; set; }
    public List<string> TagNames { get; set; } = new();
    public int? EncryptionVersion { get; set; }
    public bool Deleted { get; set; }
}