using System.Text.Json.Serialization;

namespace Api.Entities.Dtos;

public class CreateLoginDto
{
    [JsonPropertyName("userId")]
    public Guid UserId { get; set; }
    public string? EncryptedDataBase64 { get; set; }
    public string[] TagNames { get; set; } = [];
    public int? EncryptionVersion { get; set; }
    public string? InitializationVectorBase64 { get; set; }
}