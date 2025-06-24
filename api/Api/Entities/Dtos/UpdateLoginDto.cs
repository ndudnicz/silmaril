namespace Api.Entities.Dtos;

public class UpdateLoginDto
{
    public Guid Id { get; set; }
    public string? EncryptedDataBase64 { get; set; }
    public List<string> TagNames { get; set; } = new();
    public int? EncryptionVersion { get; set; }
}