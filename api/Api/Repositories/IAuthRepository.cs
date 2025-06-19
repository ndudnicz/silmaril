using Api.Entities;

namespace Api.Repositories;

public interface IAuthRepository
{
    public Task<RefreshToken> GetAsync(string refreshTokenHash);
    public Task<RefreshToken> UpsertAsync(RefreshToken refreshToken);
    public Task<int> DeleteRefreshTokenAsync(string refreshTokenHash);
}