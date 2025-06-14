using Api.Exceptions;

namespace Api.Services.Exceptions;

public class InvalidPassword() : MyException("Invalid password.");
public class InvalidRefreshToken() : MyException("Invalid refresh token.");
public class ExpiredRefreshToken() : MyException("Refresh token expired.");