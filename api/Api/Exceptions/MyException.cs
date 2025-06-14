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