using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Entities;

[Table("tags")]
public class Tag: MyEntity
{
    [Column("name")]
    [MaxLength(MaxStringLength)]
    public required string Name { get; set; }
}