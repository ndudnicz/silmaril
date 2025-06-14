namespace Api.Services.Exceptions;

[System.Serializable]
public class TagServiceException: Exception
{
    public TagServiceException() { }
    public TagServiceException(string message) : base(message) { }
    public TagServiceException(string message, Exception inner) : base(message, inner) { }
    protected TagServiceException(
      System.Runtime.Serialization.SerializationInfo info,
      System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
    
    public static TagServiceException TagNotFound(int id)
    {
        return new TagServiceException($"Tag with id {id} not found.");
    }
    
    public static TagServiceException TagNameNotFound(string name)
    {
        return new TagServiceException($"Tag with name '{name}' not found.");
    }
}