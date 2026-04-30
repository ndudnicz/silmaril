using System.Net;

namespace Api.Exceptions;

[Serializable]
public abstract class MyException : Exception, IMyException
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
}