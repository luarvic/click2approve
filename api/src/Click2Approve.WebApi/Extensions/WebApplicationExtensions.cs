using Click2Approve.Infrastructure.Notifications;
using Hangfire;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.WebApi.Extensions;

/// <summary>
/// Extends <see cref="WebApplication"/>.
/// </summary>
public static class WebApplicationExtensions
{
    /// <summary>
    /// Initializes the application database.
    /// </summary>
    public static WebApplication InitializeDatabase<TDbContext>(this WebApplication app)
        where TDbContext : DbContext
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TDbContext>();
        db.Database.EnsureCreated();
        return app;
    }

    /// <summary>
    /// Registers the recurring job that dispatches pending notification emails.
    /// </summary>
    public static WebApplication AddNotificationEmailDispatchJob(this WebApplication app)
    {
        if (app.Environment.IsEnvironment("Test")) return app;

        var recurringJobManager = app.Services.GetRequiredService<IRecurringJobManager>();
        recurringJobManager.AddOrUpdate<NotificationEmailDispatchJob>(
            nameof(NotificationEmailDispatchJob),
            app.Configuration["Hangfire:Queues:Default:Name"]
                ?? throw new InvalidOperationException("The Hangfire default queue is required."),
            job => job.DispatchAsync(),
            app.Configuration["Notifications:Channels:Email:Dispatch:Cron"] ?? "*/1 * * * *");
        return app;
    }

    /// <summary>
    /// Configures cross-origin resource sharing from the application configuration.
    /// </summary>
    public static WebApplication UseConfiguredCors(this WebApplication app, params string[] exposedHeaders)
    {
        var allowedOrigins = app.Configuration.GetSection("AllowedOrigins").Get<string[]>();
        if (allowedOrigins is null || allowedOrigins.Length == 0) return app;

        app.UseCors(policy =>
        {
            policy.AllowAnyHeader()
                .AllowAnyMethod();
            if (exposedHeaders.Length > 0)
            {
                policy.WithExposedHeaders(exposedHeaders);
            }

            policy.WithOrigins(allowedOrigins);
        });
        return app;
    }

    /// <summary>
    /// Enables development-only API and background-job tooling.
    /// </summary>
    public static WebApplication UseDevelopmentTooling(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment()) return app;

        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseHangfireDashboard();
        return app;
    }
}
