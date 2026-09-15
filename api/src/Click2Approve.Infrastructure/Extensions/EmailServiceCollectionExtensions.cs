using Azure.Core;
using Azure.Communication.Email;
using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Infrastructure.Email;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.Infrastructure.Extensions;

/// <summary>
/// Registers email delivery infrastructure for background workers.
/// </summary>
public static class EmailServiceCollectionExtensions
{
    /// <summary>
    /// Adds Azure Communication Services email delivery.
    /// </summary>
    public static IServiceCollection AddAzureEmailDeliveryServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        if (!configuration.GetSection("Email").GetValue<bool>("IsEnabled"))
        {
            services.AddSingleton<IEmailService, EmailServiceStub>();
            return services;
        }

        var settings = configuration.GetSection("AzureEmailCommunication");
        var options = new EmailClientOptions
        {
            Retry =
            {
                Mode = RetryMode.Fixed,
                Delay = TimeSpan.FromSeconds(settings.GetValue<int>("RetryDelaySeconds")),
                MaxRetries = settings.GetValue<int>("MaxRetryAttempts")
            }
        };
        var endpoint = settings.GetValue<string>("Endpoint")
            ?? throw new InvalidOperationException("AzureEmailCommunication configuration is invalid.");
        services.AddSingleton(serviceProvider => new EmailClient(
            new Uri(endpoint),
            serviceProvider.GetRequiredService<TokenCredential>(),
            options));
        services.AddSingleton<IEmailService, AzureEmailCommunicationService>();
        return services;
    }
}
