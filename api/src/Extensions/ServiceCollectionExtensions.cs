using api.Models;

namespace api.Extensions;

// Extends IServiceCollection interface.
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication();
        services.AddAuthorization();
        services.AddIdentityApiEndpoints<AppUser>()
            .AddEntityFrameworkStores<ApiDbContext>();
        return services;
    }
}
