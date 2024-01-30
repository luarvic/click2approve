using System.Text;

namespace api.Services;

public class TokenService : ITokenService
{
    public (string Username, string Password) GetCredentialsFromToken(string token)
    {
        var bytes = Convert.FromBase64String(token);
        var credentials = Encoding.UTF8.GetString(bytes).Split(':', 2);
        return (credentials[0], credentials[1]);
    }

    public string GetTokenFromCredentials(string username, string password)
    {
        var bytes = Encoding.UTF8.GetBytes($"{username}:{password}");
        return Convert.ToBase64String(bytes);
    }
}
