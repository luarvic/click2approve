namespace Click2Approve.WebAPI.Tests.Models;

/// <summary>
/// Represents user credentials.
/// </summary>
public class Credentials
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
