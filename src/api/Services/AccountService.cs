using api.Models;
using Microsoft.AspNetCore.Identity;

namespace api.Services;

public class AccountService(UserManager<AppUser> userManager) : IAccountService
{
    private readonly UserManager<AppUser> _userManager = userManager;

    public async Task RegisterUserAsync(string username, string password, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByNameAsync(username);
        if (user != null)
        {
            throw new Exception($"Username {username} already exists.");
        }

        var result = await _userManager.CreateAsync(new AppUser() { UserName = username }, password);
        if (!result.Succeeded)
        {
            throw new Exception(string.Join(",", result.Errors));
        }
    }

    public async Task AuthenticateUserAsync(string username, string password, CancellationToken cancellationToken)
    {
        const string errorMessage = "Incrorrect username or password.";
        var user = await _userManager.FindByNameAsync(username) ?? throw new Exception(errorMessage);
        var result = await _userManager.CheckPasswordAsync(user, password);
        if (!result)
        {
            throw new Exception(errorMessage);
        }
    }
}
