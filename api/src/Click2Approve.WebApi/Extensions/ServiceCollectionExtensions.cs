using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Application.Abstractions.Identity;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Email;
using Click2Approve.Infrastructure.Events;
using Click2Approve.Infrastructure.FileStorage;
using Click2Approve.Infrastructure.Identity;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Identity;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.OpenApi;

namespace Click2Approve.WebApi.Extensions;

/// <summary>
/// Extends IServiceCollection interface.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds and configures AuthN/Z services to the service collection.
    /// </summary>
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {
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
    /// Adds Azure Queue Storage event transport services.
    /// </summary>
    public static IServiceCollection AddEventQueueServices(this IServiceCollection services)
    {
        services.AddSingleton<IEventQueue, AzureEventQueue>();
        return services;
    }

    /// <summary>
    /// Adds and configures Swagger services to the service collection.
    /// </summary>
    public static IServiceCollection AddSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "Click2Approve API Specification",
            });
            options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "ApiSpecification.XML"));
            options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "JWT Authorization header using the Bearer scheme."
            });
            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("bearer", document)] = []
            });
        });
        return services;
    }
}
