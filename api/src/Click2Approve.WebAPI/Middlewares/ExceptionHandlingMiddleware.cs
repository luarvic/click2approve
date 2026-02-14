using System.Net.Mime;
using Click2Approve.WebAPI.Exceptions;
using Click2Approve.WebAPI.Extensions;
using Click2Approve.WebAPI.Models.Auxiliary;
using Microsoft.AspNetCore.WebUtilities;

namespace Click2Approve.WebAPI.Middlewares;

/// <summary>
/// Middleware for handling exceptions globally and returning consistent error responses.
/// </summary>
/// <param name="next">The next middleware in the pipeline.</param>
/// <param name="logger">The logger instance.</param>
public class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger = logger;

    public async Task InvokeAsync(
        HttpContext context)
    {
        try
        {
            await _next(context);

            if (context.Response.IsErrorStatusCode() && !context.Response.HasStarted)
            {
                var problemDetails = new ErrorResponse(
                    ReasonPhrases.GetReasonPhrase(context.Response.StatusCode),
                    context.Response.StatusCode,
                    context.TraceIdentifier);

                context.Response.StatusCode = context.Response.StatusCode;
                context.Response.ContentType = MediaTypeNames.Application.Json;
                await context.Response.WriteAsJsonAsync(problemDetails);
            }
        }
        catch (Exception e)
        {
            var logLevel = e switch
            {
                UnauthorizedAccessException => LogLevel.Warning,
                // Base exception should go last to avoid shadowing more specific exceptions.
                BaseException => LogLevel.Warning,
                _ => LogLevel.Error
            };

            if (_logger.IsEnabled(logLevel))
                _logger.Log(logLevel, e, "Request {RequestId} {Method} {Path} failed with message: {Message}",
                    context.TraceIdentifier, context.Request.Method, context.Request.Path, e.Message);

            var statusCode = e switch
            {
                UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
                // Base exception should go last to avoid shadowing more specific exceptions.
                BaseException => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError
            };

            var problemDetails = new ErrorResponse(
                title: e is BaseException ? e.Message : "An unexpected error occurred. Please try again later.",
                status: statusCode,
                traceId: context.TraceIdentifier
            );

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = MediaTypeNames.Application.Json;
            await context.Response.WriteAsJsonAsync(problemDetails);
        }
    }
}
