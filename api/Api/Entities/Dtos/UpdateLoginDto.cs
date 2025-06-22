namespace Api.Entities.Dtos;

public class UpdateLoginDto
{
    public Guid Id { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
    public string? EncryptedDataBase64 { get; set; }
    public List<Tag> Tags { get; set; } = new();
    public int? EncryptionVersion { get; set; }
}