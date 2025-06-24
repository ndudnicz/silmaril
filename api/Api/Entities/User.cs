using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Api.Entities.Dtos;
using Api.Helpers;

namespace Api.Entities;

[Table("users")]
public class User: MyEntity
{
    [Column("username_hash")]
    [MaxLength(Sha512HashLength)]
    public required string UsernameHash { get; set; }
    [Column("password_hash")]
    [MaxLength(Argon2idHashLength)]
    public required string PasswordHash { get; set; }
    [Column("salt")]
    public required byte[] Salt { get; set; }
    
    public static User FromCreateUserDto(CreateUserDto createUserDto)
    {
        return new User
        {
            UsernameHash = CryptoHelper.Sha512(createUserDto.Username),
            PasswordHash = CryptoHelper.Argon2idHash(createUserDto.Password),
            Salt = CryptoHelper.GenerateSalt128()
        };
    }
}