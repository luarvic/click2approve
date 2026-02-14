namespace Click2Approve.WebApi.Tests.Models;

/// <summary>
/// Represents user credentials.
/// </summary>
public class Credentials
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
