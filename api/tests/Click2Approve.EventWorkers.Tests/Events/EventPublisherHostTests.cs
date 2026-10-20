using Click2Approve.Application.Abstractions.Auditing;
using Click2Approve.Application.Abstractions.Events;
using Click2Approve.EventPublisher.Services;
using Click2Approve.Infrastructure.Events;
using Click2Approve.Infrastructure.Extensions;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Click2Approve.EventWorkers.Tests.Events;

/// <summary>Tests dependency construction for the public event publisher host.</summary>
public sealed class EventPublisherHostTests
{
    /// <summary>Verifies both workers can be constructed with the standard host registrations.</summary>
    [Fact]
    public void Host_WithPublisherRegistrations_ResolvesBothHostedWorkers()
    {
        var builder = Host.CreateApplicationBuilder(new HostApplicationBuilderSettings
        {
            EnvironmentName = Environments.Development
        });
        builder.Services.AddAzureServiceAuthentication(builder.Configuration);
        builder.Services.AddDbContext<ApiDbContext>(options => options.UseSqlServer());
        builder.Services.AddSingleton<IAuditContext, DisabledAuditContext>();
        builder.Services.AddSingleton<IEventQueue, AzureEventQueue>();
        builder.Services.AddSingleton<IEventPriorityResolver, ConfigurationEventPriorityResolver>();
        builder.Services.AddHostedService<EventQueuePublisherService>();
        builder.Services.AddHostedService<DeletionEventPublisherService>();

        using var host = builder.Build();
        var workers = host.Services.GetServices<IHostedService>().ToArray();

        Assert.Collection(workers,
            worker => Assert.IsType<EventQueuePublisherService>(worker),
            worker => Assert.IsType<DeletionEventPublisherService>(worker));
    }
}
