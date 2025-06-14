using Api.Exceptions;

namespace Api.Services.Exceptions;

public class LoginNotFound(int id) : MyException($"Login with id '{id}' not found.");
public class TagAlreadyExistsForLogin(string tagName) : MyException($"This item already has the tag '{tagName}'.");