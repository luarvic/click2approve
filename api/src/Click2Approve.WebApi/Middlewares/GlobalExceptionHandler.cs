using System.Net.Mime;
using Click2Approve.WebApi.Exceptions;
using Click2Approve.WebApi.Models.Auxiliary;
using Microsoft.AspNetCore.Diagnostics;

namespace Click2Approve.WebApi.Middlewares;

/// <summary>
/// Handles unhandled exceptions globally and returns consistent error responses.
/// </summary>
/// <param name="logger">The logger instance.</param>
public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger = logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var isCustomException = exception is BaseException;
        var logLevel = exception switch
        {
            UnauthorizedAccessException => LogLevel.Warning,
            _ when isCustomException => LogLevel.Warning,
            _ => LogLevel.Error
        };

        if (_logger.IsEnabled(logLevel))
            _logger.Log(logLevel, exception, "Request {RequestId} {Method} {Path} failed with message: {Message}",
                httpContext.TraceIdentifier, httpContext.Request.Method, httpContext.Request.Path, exception.Message);

        if (httpContext.Response.HasStarted)
            return false;

        var statusCode = exception switch
        {
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            _ when isCustomException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };

        var problemDetails = new ErrorResponse(
            title: isCustomException ? exception.Message : "An unexpected error occurred. Please try again later.",
            status: statusCode,
            traceId: httpContext.TraceIdentifier);

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = MediaTypeNames.Application.ProblemJson;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
