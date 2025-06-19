namespace Api.Entities.Dtos;

public class UpdateUserPasswordDto
{
    public required string OldPassword { get; set; }
    public required string NewPassword { get; set; }
}