namespace Api.Entities.Dtos;

public class CreateLoginDto
{
    public Guid UserId { get; set; }
    public required byte[] EncryptedName { get; set; }
    public byte[]? EncryptedIdentifier { get; set; }
    public byte[]? EncryptedPassword { get; set; }
    public byte[]? EncryptedUrl { get; set; }
    public byte[]? EncryptedNotes { get; set; }
    public string[] TagNames { get; set; } = [];
}