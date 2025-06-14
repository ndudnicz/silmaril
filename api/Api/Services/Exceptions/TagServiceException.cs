using Api.Exceptions;

namespace Api.Services.Exceptions;

public class TagNotFound(int id): MyException($"Tag with id {id} not found.");
public class TagNameNotFound(string name): MyException($"Tag with name '{name}' not found.");