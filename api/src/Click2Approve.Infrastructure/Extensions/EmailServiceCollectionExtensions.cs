using Azure.Core;
using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Infrastructure.Email;
using Microsoft.Extensions.Azure;
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
        services.AddAzureClients(clientBuilder =>
        {
            clientBuilder.AddEmailClient(settings.GetValue<string>("ConnectionString"))
                .ConfigureOptions(options =>
                {
                    options.Retry.Mode = RetryMode.Fixed;
                    options.Retry.Delay = TimeSpan.FromSeconds(settings.GetValue<int>("RetryDelaySeconds"));
                    options.Retry.MaxRetries = settings.GetValue<int>("MaxRetryAttempts");
                });
        });
        services.AddSingleton<IEmailService, AzureEmailCommunicationService>();
        return services;
    }
}
