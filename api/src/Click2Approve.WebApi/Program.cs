using System.Text.Json.Serialization;
using Asp.Versioning;
using Click2Approve.Application.Abstractions.Authorization;
using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Application.Abstractions.Services.ApprovalRequests;
using Click2Approve.Application.Abstractions.Services.Notifications;
using Click2Approve.Application.Abstractions.Services.Tenants;
using Click2Approve.Application.Abstractions.Services.UserFiles;
using Click2Approve.Application.Abstractions.Services.UserProfiles;
using Click2Approve.Application.Abstractions.TenantContext;
using Click2Approve.Application.Authorization;
using Click2Approve.Application.Services.ApprovalRequests;
using Click2Approve.Application.Services.Notifications;
using Click2Approve.Application.Services.Tenants;
using Click2Approve.Application.Services.UserFiles;
using Click2Approve.Application.Services.UserProfiles;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Authorization;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Middlewares;
using Click2Approve.WebApi.TenantContext;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1.0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
});
builder.Services.AddCors();
builder.Services.AddDbContext<ApiDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Default");
    options.UseAzureSql(connectionString);
});
builder.Services.AddHttpContextAccessor();
// Use AddEmailServices() instead of AddAzureEmailServices() to switch to the SmtpEmailService implementation.
builder.Services.AddAzureEmailServices(builder.Configuration);
builder.Services.AddAzureFileStorageServices(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();
// Background jobs use the production SQL Server storage and are not part of the HTTP test host.
if (!builder.Environment.IsEnvironment("Test"))
{
    builder.Services.AddHangfireServices(builder.Configuration);
}
builder.Services.AddHttpClient();
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddSwagger();

// Application services
builder.Services.AddScoped<IAccessPolicy, DefaultAccessPolicy>();
builder.Services.AddScoped<IAssigneeResolver, UserOnlyAssigneeResolver>();
builder.Services.AddScoped<IApprovalRequestAssigneeGlobalIdResolver, DefaultApprovalRequestAssigneeGlobalIdResolver>();
builder.Services.AddScoped<IApprovalRequestCompletionAttributor, ApprovalRequestCompletionAttributor>();
builder.Services.AddScoped<IApprovalRequestService, ApprovalRequestService>();
builder.Services.AddScoped<IApprovalRequestTaskCompletionAttributor, ApprovalRequestTaskCompletionAttributor>();
builder.Services.AddScoped<IApprovalRequestTaskService, ApprovalRequestTaskService>();
builder.Services.AddScoped<IApprovalWorkflowService, ApprovalWorkflowService>();
builder.Services.AddScoped<IDomainEventService, DomainEventService>();
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<IUserFileService, UserFileService>();
builder.Services.AddScoped<IUserNotificationPreferenceService, UserNotificationPreferenceService>();
builder.Services.AddScoped<IUserProfileAccessService, DefaultUserProfileAccessService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();

// Infrastructure services
builder.Services.AddScoped<IAccessScopeProvider, AccessScopeProvider>();
builder.Services.AddScoped<IApprovalRequestRepository, ApprovalRequestRepository>();
builder.Services.AddScoped<IApprovalRequestTaskRepository, ApprovalRequestTaskRepository>();
builder.Services.AddScoped<IEventDeliveryRepository, EventDeliveryRepository>();
builder.Services.AddScoped<ITenantContext, RequestTenantContext>();
builder.Services.AddScoped<ITenantRepository, TenantRepository>();
builder.Services.AddScoped<IUnitOfWork>(serviceProvider => serviceProvider.GetRequiredService<ApiDbContext>());
builder.Services.AddScoped<IUserFileRepository, UserFileRepository>();
builder.Services.AddScoped<IUserNotificationPreferenceRepository, UserNotificationPreferenceRepository>();

var app = builder.Build();

app.InitializeDatabase<ApiDbContext>();
app.AddNotificationEmailDispatchJob();
app.UseConfiguredCors();
app.UseDevelopmentTooling();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseRouting();
app.UseAuthentication();
app.UseMiddleware<InitialTenantSetupMiddleware>();
app.UseMiddleware<DefaultTenantResolutionMiddleware>();
app.UseAuthorization();
app.MapControllers();
app.MapGroup("/api/v1/account").MapIdentityApi<AppUser>();

app.Run();
