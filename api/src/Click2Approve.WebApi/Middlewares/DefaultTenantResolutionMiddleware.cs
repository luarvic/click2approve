using Click2Approve.Application.Services.Tenants;
using Click2Approve.Application.Services.TenantContext;
using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity;

namespace Click2Approve.WebApi.Middlewares;

/// <summary>
/// Resolves the open-source tenant scope for authenticated requests.
/// </summary>
public class DefaultTenantResolutionMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;

    public async Task InvokeAsync(
        HttpContext context,
        UserManager<AppUser> userManager,
        ITenantService tenantService,
        ITenantContext tenantContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var user = await userManager.GetUserAsync(context.User)
                ?? throw new UnauthorizedAccessException("User not found.");
            var tenant = await tenantService.GetRequiredDefaultAsync(user, context.RequestAborted);
            tenantContext.SetTenantId(tenant.Id);
        }

        await _next(context);
    }
}
