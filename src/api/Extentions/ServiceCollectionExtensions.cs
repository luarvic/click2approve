using api.Authentication;
using api.Models;
using Microsoft.AspNetCore.Authentication;

namespace api.Extentions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddItentityServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddIdentityCore<AppUser>(options =>
        {
            // For simplicity sake let's allow any passwords with minimum length equals three.
            // TODO configure password options based on requirements.
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireDigit = false;
            options.Password.RequireUppercase = false;
            options.Password.RequiredLength = 3;
        }).AddEntityFrameworkStores<FileManagerDbContext>();
        services.AddAuthentication("Basic")
            .AddScheme<AuthenticationSchemeOptions, BasicAuthenticationHandler>("Basic", null);
        return services;
    }
}
