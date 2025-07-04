using System.ComponentModel.DataAnnotations.Schema;

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
    public List<Tag> Tags { get; set; } = [];
    [Column("deleted")]
    public bool Deleted { get; set; } = false;
    [NotMapped]
    public string[] TagNames => Tags.Select(t => t.Name).ToArray();
    [Column("vault_id")]
    public required Guid VaultId { get; set; }
}