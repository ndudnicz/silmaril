using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Entities;

public class Vault: MyEntity
{
    [Column("name")]
    [MaxLength(MaxStringLength)]
    public required string Name { get; set; }
    [Column("user_id")]
    public Guid UserId { get; set; }
}