namespace api.Services;

// Defines a contract for managing authorization token logic.
public interface ITokenService
{
    (string Username, string Password) GetCredentialsFromToken(string token);
    string GetTokenFromCredentials(string username, string password);
}
