namespace Api.Entities.Dtos;

public class CreateUserDto
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}