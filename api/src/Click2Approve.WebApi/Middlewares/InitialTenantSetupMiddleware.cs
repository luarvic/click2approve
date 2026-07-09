using Click2Approve.Application.Services.Tenants;
using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity;

namespace Click2Approve.WebApi.Middlewares;

/// <summary>
/// Performs first-login setup for authenticated users.
/// </summary>
public class InitialTenantSetupMiddleware(RequestDelegate next) : InitialTenantSetupMiddlewareBase(next)
{
    public async Task InvokeAsync(
        HttpContext context,
        UserManager<AppUser> userManager,
        ITenantService tenantService)
    {
        await InvokeCoreAsync(context, userManager, tenantService, static (_, _) => Task.CompletedTask);
    }
}
