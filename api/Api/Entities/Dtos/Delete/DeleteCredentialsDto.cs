namespace Api.Entities.Dtos.Delete;

public class DeleteCredentialsDto
{
    public required IEnumerable<Guid> Ids { get; set; }
}