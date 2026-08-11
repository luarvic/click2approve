using System.Net;
using System.Net.Mail;
using Azure.Core;
using Azure.Storage.Blobs.Models;
using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Application.Abstractions.Identity;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Email;
using Click2Approve.Infrastructure.FileStorage;
using Click2Approve.Infrastructure.Identity;
using Click2Approve.Infrastructure.Notifications;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Identity;
using FluentEmail.Core.Interfaces;
using FluentEmail.Smtp;
using Hangfire;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Azure;
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
        services.AddScoped<IUserProvisioningService, UserProvisioningService>();
        services.AddScoped<ILookupNormalizer, LowerInvariantLookupNormalizer>();
        return services;
    }

    /// <summary>
    /// Adds and configures Hangfire services to the service collection.
    /// </summary>
    public static IServiceCollection AddHangfireServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("The default database connection string is required.");
        var defaultQueue = configuration["Hangfire:Queues:Default:Name"]
            ?? throw new InvalidOperationException("The Hangfire default queue is required.");
        var emailQueue = configuration["Hangfire:Queues:Email:Name"]
            ?? throw new InvalidOperationException("The Hangfire email queue is required.");
        if (defaultQueue == emailQueue)
        {
            throw new InvalidOperationException("The Hangfire default and email queues must differ.");
        }

        services.AddHangfire(config =>
        {
            config.UseSqlServerStorage(connectionString)
                .WithJobExpirationTimeout(TimeSpan.FromMinutes(configuration.GetValue<int>("Hangfire:Jobs:ExpirationTimeoutMinutes")))
                .UseFilter(new NotificationEmailDispatchJobConcurrencyFilter(
                    configuration.GetValue<int>("Notifications:Channels:Email:Dispatch:LockTimeoutSeconds")));
        });
        services.AddHangfireServer(options =>
        {
            options.Queues = [defaultQueue];
            options.WorkerCount = configuration.GetValue<int>("Hangfire:Queues:Default:WorkerCount");
        });
        services.AddHangfireServer(options =>
        {
            options.Queues = [emailQueue];
            options.WorkerCount = configuration.GetValue<int>("Hangfire:Queues:Email:WorkerCount");
        });
        return services;
    }

    /// <summary>
    /// Adds and configures Email services to the service collection.
    /// </summary>
    public static IServiceCollection AddEmailServices(this IServiceCollection services, IConfiguration configuration)
    {
        var emailSettings = configuration.GetSection("Email");
        var emailServiceIsEnabled = emailSettings.GetValue<bool>("IsEnabled");
        if (!emailServiceIsEnabled)
        {
            services.AddSingleton<IEmailService, EmailServiceStub>();
        }
        else
        {
            var fromEmailAddress = emailSettings["FromEmailAddress"];
            var host = emailSettings["Host"];
            var port = emailSettings.GetValue<int>("Port");
            services.AddFluentEmail(fromEmailAddress);
            var username = emailSettings["Username"];
            var password = emailSettings["Password"];
            services.AddTransient<ISender>(x =>
                new SmtpSender(new SmtpClient(host, port)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential
                    {
                        UserName = username,
                        Password = password
                    }
                }));
            services.AddTransient<IEmailService, EmailService>();
        }
        services.AddTransient<IEmailSender<AppUser>, IdentityEmailService>();
        return services;
    }

    /// <summary>
    /// Adds and configures Azure Email services to the service collection.
    /// </summary>
    public static IServiceCollection AddAzureEmailServices(this IServiceCollection services, IConfiguration configuration)
    {
        if (!configuration.GetSection("Email").GetValue<bool>("IsEnabled"))
        {
            services.AddSingleton<IEmailService, EmailServiceStub>();
        }
        else
        {
            var settings = configuration.GetSection("AzureEmailCommunication");
            var connectionString = settings.GetValue<string>("ConnectionString");
            var retryDelaySeconds = settings.GetValue<int>("RetryDelaySeconds");
            var maxRetryAttempts = settings.GetValue<int>("MaxRetryAttempts");
            services.AddAzureClients(clientBuilder =>
            {
                clientBuilder.AddEmailClient(connectionString)
                    .ConfigureOptions(options =>
                    {
                        options.Retry.Mode = RetryMode.Fixed;
                        options.Retry.Delay = TimeSpan.FromSeconds(retryDelaySeconds);
                        options.Retry.MaxRetries = maxRetryAttempts;
                    });
            });
            services.AddSingleton<IEmailService, AzureEmailCommunicationService>();
        }
        services.AddSingleton<IEmailSender<AppUser>, IdentityEmailService>();
        return services;
    }

    /// <summary>
    /// Adds and configures Azure Blob Storage services.
    /// </summary>
    public static IServiceCollection AddAzureFileStorageServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IPrivateFileStorage>(_ => new AzureFileStorage(configuration, "PrivateFileStorage"));
        services.AddSingleton<IPublicFileStorage>(_ => new AzureFileStorage(configuration, "PublicFileStorage", PublicAccessType.Blob));
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
