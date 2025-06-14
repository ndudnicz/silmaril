using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Entities;

public class RefreshToken: MyEntity
{
    [Column("user_id")]
    public required int UserId { get; set; }
    [Column("token_hash")]
    [MaxLength(MaxLongStringLength)]
    public required string TokenHash { get; set; }
    [Column("expires")]
    public required DateTime Expires { get; set; }
}