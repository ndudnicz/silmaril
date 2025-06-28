namespace  Api.Exceptions;

[Serializable]
public abstract class MyException: Exception
{
    protected MyException() { }
    protected MyException(string message) : base(message) { }
    protected MyException(string message, Exception inner) : base(message, inner) { }
    protected MyException(
        System.Runtime.Serialization.SerializationInfo info,
        System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
}

public class InvalidPassword() : MyException("Invalid password.");
public class InvalidRefreshToken() : MyException("Invalid refresh token.");
public class UnknownRefreshToken() : MyException("Unknown refresh token.");
public class ExpiredRefreshToken() : MyException("Refresh token expired.");
public class LoginNotFound(Guid id) : MyException($"Login with id '{id.ToString()}' not found.");
public class LoginsNotFoundBulk(IEnumerable<Guid> id) : MyException($"Logins with ids '{string.Join(',', id)}' not found.");
public class TagsNotFound(string propertyName, string properties): MyException($"Tags with {propertyName} '{properties}' not found.");
public class UserNotFound(string propertyName, string properties): MyException($"User with {propertyName} '{properties}' not found.");
public class InvalidPasswordFormat() : MyException("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character.");
public class UserNameAlreadyExists() : MyException("Username already exists.");