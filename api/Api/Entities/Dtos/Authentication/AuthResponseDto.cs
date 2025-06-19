namespace Api.Entities.Dtos.Authentication;

public class AuthResponseDto
{
    public required string JwtToken { get; set; }
    public required string RefreshToken { get; set; }
    public required DateTime RefreshTokenExpiration { get; set; }
}