namespace Api.Entities.Dtos;

public class UpdateUserDto
{
    public required Guid Id { get; set; }
    public required string Username { get; set; }
}