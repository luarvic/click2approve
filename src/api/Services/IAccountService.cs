using api.Models;

namespace api.Services;

// Defines a contract for sign un and sign in logic. 
public interface IAccountService
{
    Task RegisterUserAsync(string username, string password, CancellationToken cancellationToken);
    Task AuthenticateUserAsync(string username, string password, CancellationToken cancellationToken);
}
