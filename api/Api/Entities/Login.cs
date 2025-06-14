using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Entities;

[Table("logins")]
public class Login: MyEntity
{
    [Column("user_id")]
    public int UserId { get; set; }
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
}