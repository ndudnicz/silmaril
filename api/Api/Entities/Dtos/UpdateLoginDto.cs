namespace Api.Entities.Dtos;

public class UpdateLoginDto
{
    public Guid Id { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
    public Guid UserId { get; set; }
    public required byte[] EncryptedName { get; set; }
    public byte[]? EncryptedIdentifier { get; set; }
    public byte[]? EncryptedPassword { get; set; }
    public byte[]? EncryptedUrl { get; set; }
    public byte[]? EncryptedNotes { get; set; }
    public List<Tag> Tags { get; set; } = new();
    public int? EncryptionVersion { get; set; }
}