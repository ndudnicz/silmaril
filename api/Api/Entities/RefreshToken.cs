using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Entities;

public class RefreshToken: MyEntity
{
    [Column("user_id")]
    public required Guid UserId { get; set; }
    [Column("token_hash")]
    [MaxLength(Sha512HashLength)]
    public required string TokenHash { get; set; }
    [Column("expires")]
    public required DateTime Expires { get; set; }
}