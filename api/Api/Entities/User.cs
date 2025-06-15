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
    [MaxLength(Sha512HashLength)]
    public required string PasswordHash { get; set; }
    
    public static User FromCreateUserDto(CreateUserDto createUserDto)
    {
        return new User
        {
            Username = createUserDto.Username,
            PasswordHash = CryptoHelper.Sha512(createUserDto.Password)
        };
    }

    // public static User FromUpdateUserDto(UpdateUserDto updateUserDto)
    // {
    //     return new User
    //     {
    //         Id
    //     }
    // }
}