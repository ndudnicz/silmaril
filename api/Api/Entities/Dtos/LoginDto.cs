namespace Api.Entities.Dtos;

public class LoginDto: MyEntity
{
    public List<string> TagNames { get; set; } = new();
    public Guid UserId { get; set; }
    public string? EncryptedDataBase64 { get; set; }
    public int? EncryptionVersion { get; set; }
    public string? InitializationVectorBase64 { get; set; }
    
    public static LoginDto FromLogin(Login login)
    {
        return new LoginDto
        {
            Id = login.Id,
            Created = login.Created,
            Updated = login.Updated,
            UserId = login.UserId,
            EncryptedDataBase64 = Convert.ToBase64String(login.EncryptedData ?? []),
            TagNames = login.Tags.Select(x => x.Name).ToList(),
            EncryptionVersion = login.EncryptionVersion,
            InitializationVectorBase64 = Convert.ToBase64String(login.InitializationVector ?? [])
        };
    }
    
    public static IEnumerable<LoginDto> FromLogin(IEnumerable<Login> logins)
    {
        return logins.Select(FromLogin);
    }
}