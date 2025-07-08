using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface IAuthRepository
{
    Task<RefreshToken?> GetAsync(string refreshTokenHash);
    Task<RefreshToken> UpsertAsync(RefreshToken refreshToken);
    Task<int> DeleteRefreshTokenByUserIdAsync(Guid userId);
    Task<int> DeleteAllRefreshTokensAsync();
}