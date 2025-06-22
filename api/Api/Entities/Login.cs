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
    [Column("initialization_vector")]
    public byte[]? InitializationVector { get; set; }
    public List<Tag> Tags { get; set; } = new();
    
    public static Login FromCreateLoginDto(CreateLoginDto dto)
    {
        return new Login
        {
            EncryptedData = Convert.FromBase64String(dto.EncryptedDataBase64 ?? string.Empty),
            Tags = dto.TagNames.Select(name => new Tag { Name = name }).ToList(),
            EncryptionVersion = dto.EncryptionVersion,
            InitializationVector = Convert.FromBase64String(dto.InitializationVectorBase64 ?? string.Empty)
        };
    }
    
    public static Login FromUpdateLoginDto(UpdateLoginDto dto)
    {
        return new Login
        {
            Id = dto.Id,
            Created = dto.Created,
            Updated = dto.Updated,
            EncryptedData = Convert.FromBase64String(dto.EncryptedDataBase64 ?? string.Empty),
            Tags = dto.Tags,
            EncryptionVersion = dto.EncryptionVersion,
        };
    }

    public static Login FromLoginDto(LoginDto dto)
    {
        return new Login
        {
            Id = dto.Id,
            Created = dto.Created,
            Updated = dto.Updated,
            UserId = dto.UserId,
            EncryptedData = Convert.FromBase64String(dto.EncryptedDataBase64 ?? string.Empty),
            Tags = dto.Tags,
            EncryptionVersion = dto.EncryptionVersion,
            InitializationVector = Convert.FromBase64String(dto.InitializationVectorBase64 ?? string.Empty)
        };
    }
}