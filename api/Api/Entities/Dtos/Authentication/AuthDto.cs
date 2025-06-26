namespace Api.Entities.Dtos.Authentication;

public record AuthDto
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}