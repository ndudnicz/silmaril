namespace Api.Entities.Dtos.Update;

public record UpdateVaultDto
{
    public required Guid Id { get; set; }
    public required string Name { get; init; }
}