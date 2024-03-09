using api.Models;

namespace api.Extensions;

// Extends IServiceCollection interface.
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication()
            .AddBearerToken(options =>
            {
                options.BearerTokenExpiration = TimeSpan.MaxValue;
            });
        services.AddAuthorization();
        services.AddIdentityApiEndpoints<AppUser>()
            .AddEntityFrameworkStores<FileManagerDbContext>();
        return services;
    }
}
