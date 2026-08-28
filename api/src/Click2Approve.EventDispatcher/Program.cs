using Click2Approve.Application.Abstractions.Events;
using Click2Approve.EventDispatcher;
using Click2Approve.Infrastructure.Events;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddSingleton<IEventQueue, AzureEventQueue>();
builder.Services.AddHostedService<EventQueueWorkerService>();

await builder.Build().RunAsync();
