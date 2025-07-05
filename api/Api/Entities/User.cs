using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Entities;

[Table("users")]
public class User: MyEntity
{
    [Column("username_hash")]
    [MaxLength(Sha512HashLength)]
    public required string UsernameHash { get; set; }
    [Column("password_hash")]
    [MaxLength(Argon2idHashLength)]
    public required string PasswordHash { get; set; }
    [Column("salt")]
    public required byte[] Salt { get; set; }
}