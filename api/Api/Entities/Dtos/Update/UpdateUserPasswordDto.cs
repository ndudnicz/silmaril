namespace Api.Entities.Dtos.Update;

public record UpdateUserPasswordDto
{
    public required string OldPassword { get; set; }
    public required string NewPassword { get; set; }
}