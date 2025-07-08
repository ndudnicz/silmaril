using System.Net;

namespace Api.Exceptions;

public class TagsNotFound(string propertyName, string properties): MyException($"Tags with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}