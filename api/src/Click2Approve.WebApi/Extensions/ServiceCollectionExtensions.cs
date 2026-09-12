using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Application.Abstractions.Identity;
using Click2Approve.Application.Models.Results.Identity;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Email;
using Click2Approve.Infrastructure.FileStorage;
using Click2Approve.Infrastructure.Identity;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Identity;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Click2Approve.WebApi.Extensions;

/// <summary>
/// Extends IServiceCollection interface.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds email-address rate limiting for anonymous identity email endpoints.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <returns>The service collection.</returns>
    public static IServiceCollection AddIdentityRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var permitLimit = configuration.GetValue("RateLimiting:Identity:EmailPermitLimit", 3);
        var windowInMinutes = configuration.GetValue("RateLimiting:Identity:WindowInMinutes", 15);

        services.AddScoped<IIdentityEmailRateLimitService>(serviceProvider => new IdentityEmailRateLimitService(
            serviceProvider.GetRequiredService<ApiDbContext>(),
            permitLimit,
            TimeSpan.FromMinutes(windowInMinutes)));
        return services;
    }

    /// <summary>
    /// Adds and configures AuthN/Z services to the service collection.
    /// </summary>
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddFido2(options =>
        {
            options.ServerDomain = configuration["Passkeys:RelyingPartyId"];
            options.ServerName = configuration["Passkeys:RelyingPartyName"];
            options.Origins = configuration.GetSection("Passkeys:Origins").Get<HashSet<string>>();
        });
        services.AddAuthentication();
        services.Configure<BearerTokenOptions>(IdentityConstants.BearerScheme, options =>
        {
            options.BearerTokenExpiration = TimeSpan.FromMinutes(configuration.GetValue<int>("Authentication:BearerTokenExpirationInMinutes"));
            options.RefreshTokenExpiration = TimeSpan.FromDays(configuration.GetValue<int>("Authentication:RefreshTokenExpirationInDays"));
        });
        services.AddAuthorization();
        services.AddIdentityApiEndpoints<AppUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = configuration.GetValue<int>("Identity:Password:RequiredLength");
                options.SignIn.RequireConfirmedEmail = configuration.GetValue<bool>("Identity:RequireConfirmedEmail");
                options.Lockout.MaxFailedAccessAttempts = configuration.GetValue<int>("Identity:Lockout:MaxFailedAccessAttempts");
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(configuration.GetValue<int>("Identity:Lockout:LockoutTimeSpanInMinutes"));
                options.Lockout.AllowedForNewUsers = configuration.GetValue<bool>("Identity:Lockout:AllowedForNewUsers");
            })
            .AddEntityFrameworkStores<ApiDbContext>();
        services.AddScoped<IUserStore<AppUser>, PlaceholderAwareUserStore>();
        services.RemoveAll<IUserValidator<AppUser>>();
        services.AddScoped<IUserValidator<AppUser>, PlaceholderAwareUserValidator>();
        services.AddScoped<IUserIdentityService, UserIdentityService>();
        services.AddScoped<IUserLookupService, UserLookupService>();
        services.AddScoped<IUserProvisioningService, UserProvisioningService>();
        services.AddScoped<ILookupNormalizer, LowerInvariantLookupNormalizer>();
        services.AddSingleton<IEmailSender<AppUser>, IdentityEmailService>();
        return services;
    }

    /// <summary>
    /// Adds and configures Azure Blob Storage services.
    /// </summary>
    public static IServiceCollection AddAzureFileStorageServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IUserFileStorage, AzureUserFileStorage>();
        return services;
    }

    /// <summary>
    /// Adds and configures Swagger services to the service collection.
    /// </summary>
    public static IServiceCollection AddSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "ApiSpecification.XML"));
            options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "Opaque token",
                Description = "Authorization header using the Bearer scheme. Supports Identity access tokens and personal API tokens."
            });
            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("bearer", document)] = []
            });
        });
        services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();
        return services;
    }

    /// <summary>
    /// Applies email-address rate limits to anonymous identity endpoints that send account emails.
    /// </summary>
    /// <param name="builder">The identity API endpoint builder.</param>
    /// <returns>The identity API endpoint builder.</returns>
    public static IEndpointConventionBuilder RequireIdentityRateLimiting(this IEndpointConventionBuilder builder)
    {
        builder.Add(endpointBuilder =>
        {
            if (endpointBuilder is not RouteEndpointBuilder routeEndpointBuilder)
            {
                return;
            }

            if (IsEmailRateLimitedRoute(routeEndpointBuilder.RoutePattern.RawText))
            {
                routeEndpointBuilder.FilterFactories.Add((_, next) => async invocationContext =>
                {
                    var email = GetEmail(invocationContext.Arguments);
                    if (email is null)
                    {
                        return await next(invocationContext);
                    }

                    var services = invocationContext.HttpContext.RequestServices;
                    var normalizer = services.GetRequiredService<ILookupNormalizer>();
                    var rateLimiter = services.GetRequiredService<IIdentityEmailRateLimitService>();
                    var result = await rateLimiter.TryAcquireAsync(
                        normalizer.NormalizeEmail(email),
                        invocationContext.HttpContext.RequestAborted);
                    if (result == IdentityEmailRateLimitResult.RateLimited)
                    {
                        return Results.StatusCode(StatusCodes.Status429TooManyRequests);
                    }

                    return await next(invocationContext);
                });
            }
        });
        return builder;
    }

    private static string? GetEmail(IList<object?> arguments)
    {
        return arguments.OfType<ForgotPasswordRequest>().FirstOrDefault()?.Email
            ?? arguments.OfType<ResendConfirmationEmailRequest>().FirstOrDefault()?.Email;
    }

    private static bool IsEmailRateLimitedRoute(string? route)
    {
        return route?.EndsWith("/forgotPassword", StringComparison.Ordinal) == true
            || route?.EndsWith("/resendConfirmationEmail", StringComparison.Ordinal) == true;
    }
}
