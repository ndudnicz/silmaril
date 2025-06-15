using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Entities;

public abstract class MyEntity
{
    protected const int MaxStringLength = 128;
    protected const int MaxLongStringLength = 2048;
    protected const int Sha512HashLength = 128;
    
    protected MyEntity() {}
    [Key]
    [Column("id")]
    public Guid Id { get; set; }
    [Column("created")]
    public DateTime Created { get; set; }
    [Column("updated")]
    public DateTime? Updated { get; set; }
}