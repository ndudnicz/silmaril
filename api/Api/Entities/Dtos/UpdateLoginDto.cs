namespace Api.Entities.Dtos;

public class UpdateLoginDto
{
    public Guid Id { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
    public Guid UserId { get; set; }
    public required string EncryptedName { get; set; }
    public string? EncryptedIdentifier { get; set; }
    public string? EncryptedPassword { get; set; }
    public string? EncryptedUrl { get; set; }
    public string? EncryptedNotes { get; set; }
    public List<Tag> Tags { get; set; } = new();
}