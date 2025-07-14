namespace Api.Entities.Dtos.Delete;

public class DeleteLoginsDto
{
    public required IEnumerable<Guid> Ids { get; set; }
}