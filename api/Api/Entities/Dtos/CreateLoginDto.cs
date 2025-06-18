namespace Api.Entities.Dtos;

public class CreateLoginDto
{
    public Guid UserId { get; set; }
    public byte[]? EncryptedData { get; set; }
    public string[] TagNames { get; set; } = [];
    public int? EncryptionVersion { get; set; }
}