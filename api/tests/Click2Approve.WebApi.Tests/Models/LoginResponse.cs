namespace Click2Approve.WebApi.Tests.Models;

/// <summary>
/// Represents a JSON data returned by api/account/login endpoint.
/// </summary>
public class LoginResponse
{
    public required string TokenType { get; set; }
    public required string AccessToken { get; set; }
    public required int ExpiresIn { get; set; }
    public required string RefreshToken { get; set; }
}
