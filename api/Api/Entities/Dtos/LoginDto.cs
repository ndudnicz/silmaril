namespace Api.Entities.Dtos;

public class LoginDto(byte[] encryptedData, byte[] initializationVector) : MyEntity
{
    public Guid UserId { get; set; }
    private byte[]? EncryptedData { get; set; } = encryptedData;
    public int? EncryptionVersion { get; set; }
    private byte[]? InitializationVector { get; set; } = initializationVector;
    public bool Deleted { get; set; } = false;
    public string[] TagNames { get; set; } = [];
    public Guid? VaultId { get; set; }
    public string? EncryptedDataBase64
        => EncryptedData != null ? Convert.ToBase64String(EncryptedData) : "";
    public string? InitializationVectorBase64
        => InitializationVector != null ? Convert.ToBase64String(InitializationVector) : "";
}