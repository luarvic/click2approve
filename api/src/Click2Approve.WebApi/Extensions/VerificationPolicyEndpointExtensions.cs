using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;

namespace Click2Approve.WebApi.Extensions;

/// <summary>Applies the deployment verification switch to the native Identity endpoints.</summary>
public static class VerificationPolicyEndpointExtensions
{
    /// <summary>Preserves password checks and lockout when verification is disabled.</summary>
    public static IEndpointConventionBuilder ApplyVerificationPolicy(this IEndpointConventionBuilder builder)
    {
        builder.Add(endpoint =>
        {
            if (endpoint is not RouteEndpointBuilder route) return;
            var login = route.RoutePattern.RawText?.EndsWith("/login", StringComparison.Ordinal) == true;
            var management = route.RoutePattern.RawText?.EndsWith("/manage/2fa", StringComparison.Ordinal) == true;
            if (!login && !management) return;
            route.FilterFactories.Add((_, next) => async context =>
            {
                var services = context.HttpContext.RequestServices;
                var signIn = services.GetRequiredService<SignInManager<AppUser>>();
                if (signIn.Options.SignIn.RequireConfirmedEmail) return await next(context);
                if (management) return Results.NotFound();
                var request = context.Arguments.OfType<LoginRequest>().Single();
                var user = await signIn.UserManager.FindByEmailAsync(request.Email);
                if (user is null) return Results.Problem("Failed", statusCode: StatusCodes.Status401Unauthorized);
                var result = await signIn.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
                if (!result.Succeeded)
                    return Results.Problem(result.ToString(), statusCode: StatusCodes.Status401Unauthorized);
                if (!(await signIn.UserManager.ResetAccessFailedCountAsync(user)).Succeeded)
                    return Results.Conflict();
                return Results.SignIn(await signIn.CreateUserPrincipalAsync(user),
                    authenticationScheme: IdentityConstants.BearerScheme);
            });
        });
        return builder;
    }
}
