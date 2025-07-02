using System.Net;

namespace  Api.Exceptions;

[Serializable]
public abstract class MyException: Exception, IMyException
{
    public static readonly HttpStatusCode DefaultStatusCode = HttpStatusCode.InternalServerError;
    public static readonly string DefaultMessage = "An unexpected error occurred.";
    public virtual HttpStatusCode StatusCode { get; } = DefaultStatusCode;
    public virtual string ErrorMessage { get; } = DefaultMessage;
    protected MyException() { }

    protected MyException(string message) : base(message)
    {
        ErrorMessage = message;
    }

    protected MyException(string message, Exception inner) : base(message, inner)
    {
        ErrorMessage = message;
    }
    protected MyException(
        System.Runtime.Serialization.SerializationInfo info,
        System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
}
public class InvalidPassword() : MyException("Invalid password.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.Unauthorized;
}
public class InvalidRefreshToken() : MyException("Invalid refresh token.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.Unauthorized;
}
public class UnknownRefreshToken() : MyException("Unknown refresh token.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.Unauthorized;
}
public class ExpiredRefreshToken() : MyException("Refresh token expired.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.Unauthorized;
}
public class LoginNotFound(string propertyName, string properties) : MyException($"Login with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}
public class LoginsNotFoundBulk(string propertyName, string properties) : MyException($"Logins with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}
public class TagsNotFound(string propertyName, string properties): MyException($"Tags with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}
public class UserNotFound(string propertyName, string properties): MyException($"User with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}
public class InvalidPasswordFormat() : MyException("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.BadRequest;
}
public class UserNameAlreadyExists() : MyException("Username already exists.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.Conflict;
}