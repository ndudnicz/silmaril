using Api.Entities;
using Api.Entities.Dtos;

namespace Api.Services;

public interface ILoginService
{
    public Task<Login> GetLoginAsync(Guid id);
    public Task<Login> CreateLoginAsync(CreateLoginDto createLoginDto);
    public Task<Login> AddTagToLoginAsync(Guid loginId, string tagName);
    public Task<Login> UpdateLoginAsync(UpdateLoginDto updateLoginDto);
}