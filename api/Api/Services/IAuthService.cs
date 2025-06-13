using Api.Entities;
using Api.Entities.Dtos;

namespace Api.Services;

public interface IAuthService
{
    public Task<string?> AuthAsync(AuthDto authDto);
}