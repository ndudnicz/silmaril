using System.Net;

namespace Api.Exceptions;

public class LoginNotFound(string propertyName, string properties) : MyException($"Login with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}

public class LoginsNotFound(string propertyName, string properties) : MyException($"Logins with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}