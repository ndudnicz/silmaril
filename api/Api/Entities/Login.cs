using System.ComponentModel.DataAnnotations.Schema;
using Api.Entities.Dtos;
using Api.Helpers;

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
    [Column("deleted")]
    public bool Deleted { get; set; } = false;
    [NotMapped]
    public string[] TagNames => Tags.Select(t => t.Name).ToArray();
    
    public static Login FromCreateLoginDto(CreateLoginDto dto)
    {
        return new Login
        {
            EncryptedData = CryptoHelper.DecodeBase64(dto.EncryptedDataBase64 ?? string.Empty),
            Tags = dto.TagNames.Select(name => new Tag { Name = name }).ToList(),
            EncryptionVersion = dto.EncryptionVersion,
            InitializationVector = CryptoHelper.DecodeBase64(dto.InitializationVectorBase64 ?? string.Empty)
        };
    }
    
    public static List<Login> FromCreateLoginDtos(IEnumerable<CreateLoginDto> dtos)
    {
        return dtos.Select(FromCreateLoginDto).ToList();
    }
}