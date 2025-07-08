using Api.Entities;
using Api.Repositories.EFContext;
using Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class AuthRepository(AppDbContext db): IAuthRepository
{
    public async Task<RefreshToken?> GetAsync(string refreshTokenHash)
    {
        return await db.RefreshTokens.AsNoTracking()
            .FirstOrDefaultAsync(x => x.TokenHash == refreshTokenHash);
    }
    
    public async Task<RefreshToken> UpsertAsync(RefreshToken refreshToken)
    {
        var existing = await db.RefreshTokens
            .FirstOrDefaultAsync(x => x.UserId == refreshToken.UserId);
        
        if (existing != null)
        {
            existing.TokenHash = refreshToken.TokenHash;
            existing.Expires = refreshToken.Expires;
            existing.Updated = DateTime.UtcNow;
            db.RefreshTokens.Update(existing);
        }
        else
        {
            refreshToken.Created = DateTime.UtcNow;
            db.RefreshTokens.Add(refreshToken);
        }

        await db.SaveChangesAsync();
        return refreshToken;
    }

    public async Task<int> DeleteRefreshTokenByUserIdAsync(Guid userId)
    {
        return await db.RefreshTokens
            .Where(x => x.UserId == userId)
            .ExecuteDeleteAsync();
    }

    public async Task<int> DeleteAllRefreshTokensAsync()
    {
        return await db.RefreshTokens
            .ExecuteDeleteAsync();
    }
}