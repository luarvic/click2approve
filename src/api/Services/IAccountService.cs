using api.Models;

namespace api.Services;

public interface IAccountService
{
    Task RegisterUserAsync(string username, string password, CancellationToken cancellationToken);
    Task AuthenticateUserAsync(string username, string password, CancellationToken cancellationToken);
}
