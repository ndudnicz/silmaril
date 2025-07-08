using Api.Entities.Dtos.Authentication;

namespace Api.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> AuthAsync(AuthDto authDto);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task<int> RevokeRefreshTokenByUserIdAsync(Guid userId);
}