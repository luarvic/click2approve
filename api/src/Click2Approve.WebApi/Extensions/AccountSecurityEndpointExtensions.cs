using Click2Approve.WebApi.Identity;
using Microsoft.AspNetCore.Authorization;

namespace Click2Approve.WebApi.Extensions;

/// <summary>Restricts native Identity management endpoints to interactive account sessions.</summary>
public static class AccountSecurityEndpointExtensions
{
    public static IEndpointConventionBuilder RequireAccountSecurity(this IEndpointConventionBuilder builder)
    {
        builder.Add(endpoint =>
        {
            if (endpoint is not RouteEndpointBuilder route
                || route.RoutePattern.RawText?.Contains("/manage/", StringComparison.Ordinal) != true) return;
            route.Metadata.Add(new AuthorizeAttribute(AccountSecurityPolicies.Interactive));
        });
        return builder;
    }
}
