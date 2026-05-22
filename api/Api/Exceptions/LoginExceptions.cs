using System.Net;

namespace Api.Exceptions;

public class CredentialNotFound(string propertyName, string properties) : MyException($"Credential with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}

public class CredentialsNotFound(string propertyName, string properties) : MyException($"Credentials with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}