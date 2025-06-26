namespace Api.Entities.Dtos;

public record UpdateUserPasswordDto
{
    public required string OldPassword { get; set; }
    public required string NewPassword { get; set; }
}