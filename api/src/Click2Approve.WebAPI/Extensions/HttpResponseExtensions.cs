namespace Click2Approve.WebAPI.Extensions;

/// <summary>
/// Extends HttpResponse class.
/// </summary>
public static class HttpResponseExtensions
{
    public static bool IsErrorStatusCode(
        this HttpResponse response)
        => response.StatusCode is < 200 or >= 300;
}
