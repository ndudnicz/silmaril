namespace Api.Entities.Dtos;

public record CreateUserDto
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}