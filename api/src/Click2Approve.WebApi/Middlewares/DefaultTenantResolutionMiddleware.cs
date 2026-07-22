using Click2Approve.Application.Services.Tenants;
using Click2Approve.Application.Services.TenantContext;
using Click2Approve.Domain.Exceptions;
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
            if (context.Request.RouteValues.TryGetValue("tenantId", out var routeValue))
            {
                var tenantId = ParseTenantId(routeValue);
                if (tenantId != tenant.Id)
                {
                    throw new UnauthorizedAccessException();
                }
            }

            tenantContext.SetTenantId(tenant.Id);
        }

        await _next(context);
    }

    private static long ParseTenantId(object? value)
    {
        return long.TryParse(value?.ToString(), out var tenantId) && tenantId > 0
            ? tenantId
            : throw new BusinessRuleException("The tenant route value must be a positive integer.");
    }
}
