using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Entities;

[Table("users")]
public class User: MyEntity
{
    [Column("username")]
    [MaxLength(MaxStringLength)]
    public required string Username { get; set; }
    [Column("password")]
    [MaxLength(Sha512HashLength)]
    public required string Password { get; set; }
}