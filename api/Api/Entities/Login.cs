using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Entities;

[Table("logins")]
public class Login: MyEntity
{
    [Column("user_id")]
    public int UserId { get; set; }
    [Column("name")]
    [MaxLength(MaxStringLength)]
    public required string Name { get; set; }
    [Column("identifier")]
    [MaxLength(MaxStringLength)]
    public required string Identifier { get; set; }
    [Column("encrypted_password")]
    [MaxLength(MaxLongStringLength)]
    public required string EncryptedPassword { get; set; }
    [Column("url")]
    [MaxLength(MaxStringLength)]
    public string? Url { get; set; }
    [Column("notes")]
    [MaxLength(MaxLongStringLength)]
    public string? Notes { get; set; }
}