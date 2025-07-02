using System.Net;
using System.Text.Json;
using Api.Exceptions;

namespace Api.Middlewares;

public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while processing the request.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = MyException.DefaultStatusCode;
        var message = MyException.DefaultMessage;
        if (exception is IMyException myException)
        {
            statusCode = myException.StatusCode;
            message = myException.ErrorMessage;
        }
        else
        {
            logger.LogError(exception, "An error occurred while processing the request.");
        }
        
        var result = JsonSerializer.Serialize(new
        {
            error = message,
            statusCode = (int)statusCode
        });

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        await context.Response.WriteAsync(result);
    }
}