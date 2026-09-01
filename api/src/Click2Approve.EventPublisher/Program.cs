using Click2Approve.Application.Abstractions.Auditing;
using Click2Approve.Application.Abstractions.Events;
using Click2Approve.EventPublisher.Services;
using Click2Approve.Infrastructure.Events;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<ApiDbContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("Default")));

// Application services
builder.Services.AddSingleton<IAuditContext, DisabledAuditContext>();

// Infrastructure services
builder.Services.AddSingleton<IEventQueue, AzureEventQueue>();
builder.Services.AddSingleton<IEventPriorityResolver, ConfigurationEventPriorityResolver>();

// Worker services
builder.Services.AddHostedService<EventQueuePublisherService>();

await builder.Build().RunAsync();
