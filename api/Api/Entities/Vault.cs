using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Entities;

public class Vault: MyEntity
{
    [Column("name")]
    public required string Name { get; set; }
    [Column("user_id")]
    public long UserId { get; set; }
    public List<Login> Logins { get; set; } = [];
}