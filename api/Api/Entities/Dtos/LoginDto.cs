namespace Api.Entities.Dtos;

public class LoginDto : MyEntity
{
    public Guid VaultId { get; set; }
    public string[] TagNames { get; set; }
    public Guid UserId { get; set; }
    private byte[]? EncryptedData { get; }
    public string? EncryptedDataBase64
        => EncryptedData != null ? Convert.ToBase64String(EncryptedData) : "";
    public int? EncryptionVersion { get; set; }
    private byte[]? InitializationVector { get; }
    public string? InitializationVectorBase64
        => InitializationVector != null ? Convert.ToBase64String(InitializationVector) : "";
    public bool Deleted { get; set; }

    public LoginDto(
        Guid id,
        DateTime created,
        DateTime? updated,
        Guid vaultId,
        string[] tagNames,
        Guid userId,
        byte[]? encryptedData,
        int? encryptionVersion,
        byte[]? initializationVector,
        bool deleted
    )
    {
        Id = id;
        Created = created;
        Updated = updated;
        VaultId = vaultId;
        TagNames = tagNames;
        UserId = userId;
        EncryptedData = encryptedData;
        EncryptionVersion = encryptionVersion;
        InitializationVector = initializationVector;
        Deleted = deleted;
    }
}