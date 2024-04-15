namespace click2approve.WebAPI.Tests.Models;

/// <summary>
/// Represents a JSON data returned by api/account/login endpoint.
/// </summary>
public class LoginResponseContent
{
    public required string TokenType { get; set; }
    public required string AccessToken { get; set; }
    public required int ExpiresIn { get; set; }
    public required string RefreshToken { get; set; }
}