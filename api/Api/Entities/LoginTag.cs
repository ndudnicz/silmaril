using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Entities;

[Table("login_tags")]
public class LoginTag
{
    [Column("login_id")]
    public required int LoginId { get; set; }
    [Column("tag_id")]
    public required int TagId { get; set; }
}