namespace Api.Entities.Dtos;

public class CreateLoginDto
{
    public Guid UserId { get; set; }
    public required string EncryptedName { get; set; }
    public string? EncryptedIdentifier { get; set; }
    public string? EncryptedPassword { get; set; }
    public string? EncryptedUrl { get; set; }
    public string? EncryptedNotes { get; set; }
    public string[] TagNames { get; set; } = [];
}