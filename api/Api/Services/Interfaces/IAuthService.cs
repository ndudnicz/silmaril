using Api.Entities.Dtos.Authentication;

namespace Api.Services.Interfaces;

public interface IAuthService
{
    public Task<AuthResponseDto> AuthAsync(AuthDto authDto);
    public Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    public Task<int> RevokeRefreshTokenByUserIdAsync(Guid userId);
}