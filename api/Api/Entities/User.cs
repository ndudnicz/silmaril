using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Api.Entities.Dtos;
using Api.Helpers;

namespace Api.Entities;

[Table("users")]
public class User: MyEntity
{
    [Column("username")]
    [MaxLength(MaxStringLength)]
    public required string Username { get; set; }
    [Column("password_hash")]
    [MaxLength(Argon2idHashLength)]
    public required string PasswordHash { get; set; }
    [Column("salt")]
    public required byte[] Salt { get; set; }
    
    public static User FromCreateUserDto(CreateUserDto createUserDto)
    {
        return new User
        {
            Username = createUserDto.Username,
            PasswordHash = CryptoHelper.Argon2idHash(createUserDto.Password),
            Salt = CryptoHelper.GenerateSalt128()
        };
    }
}