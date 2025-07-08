using System.Net;

namespace Api.Exceptions;

public class UserNotFound(string propertyName, string properties): MyException($"User with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}

public class UserNameAlreadyExists() : MyException("Username already exists.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.Conflict;
}
