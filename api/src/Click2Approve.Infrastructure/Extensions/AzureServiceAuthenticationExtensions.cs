using Azure.Core;
using Azure.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.Infrastructure.Extensions;

/// <summary>
/// Registers token authentication for Azure service clients.
/// </summary>
public static class AzureServiceAuthenticationExtensions
{
    /// <summary>
    /// Adds the credential used by Azure service clients.
    /// </summary>
    public static IServiceCollection AddAzureServiceAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var managedIdentityClientId = configuration["Azure:ManagedIdentityClientId"];
        services.AddSingleton<TokenCredential>(_ => string.IsNullOrWhiteSpace(managedIdentityClientId)
            ? new DefaultAzureCredential()
            : new DefaultAzureCredential(new DefaultAzureCredentialOptions
            {
                ManagedIdentityClientId = managedIdentityClientId
            }));
        return services;
    }
}
