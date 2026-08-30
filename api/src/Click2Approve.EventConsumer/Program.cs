using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Application.Abstractions.Services.Notifications;
using Click2Approve.Application.Services.Notifications;
using Click2Approve.EventConsumer.Handlers;
using Click2Approve.EventConsumer.Services;
using Click2Approve.Infrastructure.Events;
using Click2Approve.Infrastructure.Extensions;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddHttpContextAccessor();
builder.Services.AddDbContext<ApiDbContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("Default")));
builder.Services.AddAzureEmailDeliveryServices(builder.Configuration);

// Application services
builder.Services.AddScoped<AccountEmailService>();
builder.Services.AddScoped<IEventHandler, AccountEmailRequestedEventHandler>();
builder.Services.AddScoped<IEventHandler, NotificationRequestedEventHandler>();
builder.Services.AddScoped<IUserNotificationPreferenceService, UserNotificationPreferenceService>();
builder.Services.AddScoped<NotificationEmailService>();
builder.Services.AddScoped<NotificationInAppService>();

// Infrastructure services
builder.Services.AddSingleton<IEventQueue, AzureEventQueue>();
builder.Services.AddScoped<IInAppNotificationRepository, InAppNotificationRepository>();
builder.Services.AddScoped<IUnitOfWork>(serviceProvider => serviceProvider.GetRequiredService<ApiDbContext>());
builder.Services.AddScoped<IUserNotificationPreferenceRepository, UserNotificationPreferenceRepository>();

// Worker services
builder.Services.AddHostedService<EventQueueConsumerService>();

await builder.Build().RunAsync();
