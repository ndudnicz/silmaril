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
public class TagAlreadyExistsForLogin(string tagName) : MyException($"This item already has the tag '{tagName}'.");
public class TagNotFound(Guid id): MyException($"Tag with id {id.ToString()} not found.");
public class TagNameNotFound(string name): MyException($"Tag with name '{name}' not found.");
public class TagNamesNotFound(string names): MyException($"Tag with names '{names}' not found.");
public class UserNotFound(Guid id): MyException($"User with id {id.ToString()} not found.");
public class UserNameNotFound(string name): MyException($"User with name '{name}' not found.");
public class InvalidPasswordFormat() : MyException("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character.");
public class UserNameAlreadyExists() : MyException("Username already exists.");