using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;

namespace Click2Approve.WebApi.Extensions;

/// <summary>Applies email-confirmation policy to the native Identity login endpoint.</summary>
public static class VerificationPolicyEndpointExtensions
{
    /// <summary>Reports required email confirmation while preserving native sign-in and MFA enforcement.</summary>
    public static IEndpointConventionBuilder ApplyVerificationPolicy(this IEndpointConventionBuilder builder)
    {
        builder.Add(endpoint =>
        {
            if (endpoint is not RouteEndpointBuilder route) return;
            var login = route.RoutePattern.RawText?.EndsWith("/login", StringComparison.Ordinal) == true;
            if (!login) return;
            route.FilterFactories.Add((_, next) => async context =>
            {
                var services = context.HttpContext.RequestServices;
                var signIn = services.GetRequiredService<SignInManager<AppUser>>();
                if (signIn.Options.SignIn.RequireConfirmedEmail)
                {
                    var confirmationRequest = context.Arguments.OfType<LoginRequest>().Single();
                    var confirmationUser = await signIn.UserManager.FindByEmailAsync(confirmationRequest.Email);
                    if (confirmationUser is null || confirmationUser.EmailConfirmed
                        || await signIn.UserManager.IsLockedOutAsync(confirmationUser)
                        || !await signIn.UserManager.CheckPasswordAsync(confirmationUser, confirmationRequest.Password))
                        return await next(context);
                    return Results.Problem("RequiresEmailConfirmation", statusCode: StatusCodes.Status401Unauthorized);
                }
                return await next(context);
            });
        });
        return builder;
    }
}
