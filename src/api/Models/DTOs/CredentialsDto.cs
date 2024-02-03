namespace api.Models.DTOs;

// Represents payload that contains credentials.
public class CredentialsDto
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}
