using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Api.Entities.Dtos;

namespace Api.Entities;

[Table("logins")]
public class Login: MyEntity
{
    [Column("user_id")]
    public Guid UserId { get; set; }
    [Column("encrypted_name")]
    [MaxLength(MaxLongStringLength)]
    public required string EncryptedName { get; set; }
    [Column("encrypted_identifier")]
    [MaxLength(MaxLongStringLength)]
    public string? EncryptedIdentifier { get; set; }
    [Column("encrypted_password")]
    [MaxLength(MaxLongStringLength)]
    public string? EncryptedPassword { get; set; }
    [Column("encrypted_url")]
    [MaxLength(MaxLongStringLength)]
    public string? EncryptedUrl { get; set; }
    [Column("encrypted_notes")]
    [MaxLength(MaxLongStringLength)]
    public string? EncryptedNotes { get; set; }
    public List<Tag> Tags { get; set; } = new();
    
    public static Login FromCreateLoginDto(CreateLoginDto dto)
    {
        return new Login
        {
            UserId = dto.UserId,
            EncryptedName = dto.EncryptedName,
            EncryptedIdentifier = dto.EncryptedIdentifier,
            EncryptedPassword = dto.EncryptedPassword,
            EncryptedUrl = dto.EncryptedUrl,
            EncryptedNotes = dto.EncryptedNotes,
            Tags = dto.TagNames.Select(name => new Tag { Name = name }).ToList()
        };
    }
    
    public static Login FromUpdateLoginDto(UpdateLoginDto dto)
    {
        return new Login
        {
            Id = dto.Id,
            Created = dto.Created,
            Updated = dto.Updated,
            UserId = dto.UserId,
            EncryptedName = dto.EncryptedName,
            EncryptedIdentifier = dto.EncryptedIdentifier,
            EncryptedPassword = dto.EncryptedPassword,
            EncryptedUrl = dto.EncryptedUrl,
            EncryptedNotes = dto.EncryptedNotes,
            Tags = dto.Tags
        };
    }
}