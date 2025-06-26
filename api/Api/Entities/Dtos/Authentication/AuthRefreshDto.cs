namespace Api.Entities.Dtos.Authentication;

public record AuthRefreshDto
{
    public required string RefreshToken { get; set; }
}