using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Models.Auxiliary;

/// <summary>
/// Represents the error response returned by the API when an error occurs.
/// It extends the ProblemDetails class to provide a standardized format for error responses,
/// including a title, status code, and trace ID for debugging purposes.
/// </summary>
public class ErrorResponse : ProblemDetails
{
    public ErrorResponse(
        string title,
        int status,
        string traceId)
    {
        Title = title;
        Status = status;
        Extensions.Add("traceId", traceId);
    }
}
