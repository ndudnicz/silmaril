using Api.Entities;
using Api.Entities.Dtos;
using Api.Helpers;
using Api.Mappers.Interfaces;

namespace Api.Mappers;

public class LoginMapper : ILoginMapper
{
    public LoginDto ToDto(Login login)
    {
        return new LoginDto(
            login.Id,
            login.Created,
            login.Updated,
            login.VaultId,
            login.Tags?.Select(x => x.Name).ToArray() ?? [],
            login.UserId,
            login.EncryptedData,
            login.EncryptionVersion,
            login.InitializationVector,
            login.Deleted
            );
    }

    public List<LoginDto> ToDto(List<Login> logins)
    {
        return logins.Select(ToDto).ToList();
    }

    public void FillEntityFromUpdateDto(Login login, UpdateLoginDto dto, List<Tag> tags)
    {
        login.Tags = tags;
        login.EncryptedData = CryptoHelper.DecodeBase64(dto.EncryptedDataBase64 ?? string.Empty);
        login.InitializationVector = CryptoHelper.DecodeBase64(dto.InitializationVectorBase64 ?? string.Empty);
        login.EncryptionVersion = dto.EncryptionVersion;
        login.Deleted = dto.Deleted;
        login.VaultId = dto.VaultId;
    }

    public Login ToEntity(CreateLoginDto dto)
    {
        return new Login
        {
            VaultId = dto.VaultId,
            EncryptedData = CryptoHelper.DecodeBase64(dto.EncryptedDataBase64 ?? string.Empty),
            Tags = dto.TagNames.Select(name => new Tag { Name = name }).ToList(),
            EncryptionVersion = dto.EncryptionVersion,
            InitializationVector = CryptoHelper.DecodeBase64(dto.InitializationVectorBase64 ?? string.Empty)
        };
    }
    
    public List<Login> ToEntity(List<CreateLoginDto> dtos)
    {
        return dtos.Select(ToEntity).ToList();
    }
}