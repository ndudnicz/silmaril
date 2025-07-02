using System.Net;

namespace Api.Exceptions;

public interface IMyException
{
    HttpStatusCode StatusCode { get; }
    string ErrorMessage { get; }
}