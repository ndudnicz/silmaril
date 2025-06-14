namespace Api.Services.Exceptions;

[System.Serializable]
public class LoginServiceException: Exception
{
    public LoginServiceException() { }
    public LoginServiceException(string message) : base(message) { }
    public LoginServiceException(string message, Exception inner) : base(message, inner) { }
    protected LoginServiceException(
      System.Runtime.Serialization.SerializationInfo info,
      System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
    
    public static LoginServiceException LoginNotFound(int id)
    {
        return new LoginServiceException($"Login with id '{id}' not found.");
    }
}