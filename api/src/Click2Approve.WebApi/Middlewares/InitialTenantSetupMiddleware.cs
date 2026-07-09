using Click2Approve.Application.Services.Tenants;
using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity;

namespace Click2Approve.WebApi.Middlewares;

/// <summary>
/// Performs first-login setup for authenticated users.
/// </summary>
public class InitialTenantSetupMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;

    public async Task InvokeAsync(
        HttpContext context,
        UserManager<AppUser> userManager,
        ITenantService tenantService)
    {
        await InvokeCoreAsync(context, userManager, tenantService, static (_, _) => Task.CompletedTask);
    }

    protected async Task InvokeCoreAsync(
        HttpContext context,
        UserManager<AppUser> userManager,
        ITenantService tenantService,
        Func<AppUser, CancellationToken, Task> afterTenantSetupAsync)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            await _next(context);
            return;
        }

        var user = await userManager.GetUserAsync(context.User)
            ?? throw new UnauthorizedAccessException("User not found.");
        if (!user.HasLoggedIn && CanRunInitialSetup(userManager, user))
        {
            await tenantService.InitializeUserAsync(user, context.RequestAborted);
            await afterTenantSetupAsync(user, context.RequestAborted);

            user.HasLoggedIn = true;
            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException("Failed to mark the user as logged in.");
            }
        }

        await _next(context);
    }

    private static bool CanRunInitialSetup(UserManager<AppUser> userManager, AppUser user)
    {
        return !userManager.Options.SignIn.RequireConfirmedEmail || user.EmailConfirmed;
    }
}
