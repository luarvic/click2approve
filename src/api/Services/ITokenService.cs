namespace api.Services;

public interface ITokenService
{
    (string Username, string Password) GetCredentialsFromToken(string token);
    string GetTokenFromCredentials(string username, string password);
}
