using Api.Exceptions;

namespace Api.Services.Exceptions;

public class UserNotFound(int id): MyException($"User with id {id} not found.");
public class UserNameNotFound(string name): MyException($"User with name '{name}' not found.");
