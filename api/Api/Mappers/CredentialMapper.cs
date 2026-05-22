using Api.Entities;
using Api.Entities.Dtos;
using Api.Entities.Dtos.Create;
using Api.Entities.Dtos.Update;
using Api.Helpers;
using Api.Mappers.Interfaces;

namespace Api.Mappers;

public class CredentialMapper : ICredentialMapper
{
    public CredentialDto ToDto(Credential credential)
    {
        return new CredentialDto(credential.EncryptedData!, credential.InitializationVector!)
        {
            Id = credential.Id,
            Created = credential.Created,
            Updated = credential.Updated,
            UserId = credential.UserId,
            VaultId = credential.VaultId,
            TagNames = credential.Tags.Select(x => x.Name).ToArray(),
            EncryptionVersion = credential.EncryptionVersion,
            Deleted = credential.Deleted
        };
    }

    public List<CredentialDto> ToDto(List<Credential> logins)
    {
        return logins.Select(ToDto).ToList();
    }

    public void FillEntityFromUpdateDto(Credential credential, UpdateCredentialDto dto, List<Tag> tags)
    {
        credential.Tags = tags;
        credential.EncryptedData = CryptoHelper.DecodeBase64(dto.EncryptedDataBase64 ?? string.Empty);
        credential.InitializationVector = CryptoHelper.DecodeBase64(dto.InitializationVectorBase64 ?? string.Empty);
        credential.EncryptionVersion = dto.EncryptionVersion;
        credential.Deleted = dto.Deleted;
        credential.VaultId = dto.VaultId;
    }

    public Credential ToEntity(CreateCredentialDto dto)
    {
        return new Credential
        {
            VaultId = dto.VaultId,
            EncryptedData = CryptoHelper.DecodeBase64(dto.EncryptedDataBase64 ?? string.Empty),
            Tags = dto.TagNames.Select(name => new Tag { Name = name }).ToList(),
            EncryptionVersion = dto.EncryptionVersion,
            InitializationVector = CryptoHelper.DecodeBase64(dto.InitializationVectorBase64 ?? string.Empty)
        };
    }

    public List<Credential> ToEntity(List<CreateCredentialDto> dtos)
    {
        return dtos.Select(ToEntity).ToList();
    }
}