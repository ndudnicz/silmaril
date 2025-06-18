using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Api.Entities.Dtos;

namespace Api.Entities;

[Table("logins")]
public class Login: MyEntity
{
    [Column("user_id")]
    public Guid UserId { get; set; }
    [Column("encrypted_data")]
    public byte[]? EncryptedData { get; set; }
    [Column("encryption_version")]
    public int? EncryptionVersion { get; set; }
    public List<Tag> Tags { get; set; } = new();
    
    public static Login FromCreateLoginDto(CreateLoginDto dto)
    {
        return new Login
        {
            UserId = dto.UserId,
            EncryptedData = dto.EncryptedData,
            Tags = dto.TagNames.Select(name => new Tag { Name = name }).ToList(),
            EncryptionVersion = dto.EncryptionVersion
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
            EncryptedData = dto.EncryptedData,
            Tags = dto.Tags,
            EncryptionVersion = dto.EncryptionVersion
        };
    }
}