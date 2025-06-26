namespace Api.Entities.Dtos;

public record UpdateUserDto
{
    public required string Username { get; set; }
}