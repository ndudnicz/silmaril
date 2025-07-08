using System.Net;

namespace Api.Exceptions;

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

public class InvalidPasswordFormat() : MyException("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.BadRequest;
}