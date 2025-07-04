using Api.Entities;

namespace Api.Repositories.Interfaces;

public interface IAuthRepository
{
    public Task<RefreshToken?> GetAsync(string refreshTokenHash);
    public Task<RefreshToken> UpsertAsync(RefreshToken refreshToken);
    public Task<int> DeleteRefreshTokenByUserIdAsync(Guid userId);
    public Task<int> DeleteAllRefreshTokensAsync();
}