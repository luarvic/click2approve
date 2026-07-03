using System.Text.Json.Serialization;
using Click2Approve.Application.Persistence;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Middlewares;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.Application.Services.ApprovalRequestService;
using Click2Approve.Application.Services.AuditLogService;
using Click2Approve.Application.Services.StoreService;
using Click2Approve.Application.Services.UserFileService;
using Click2Approve.Infrastructure.Services.StoreService;
using Hangfire;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddCors();
builder.Services.AddDbContext<ApiDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Default");
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});
builder.Services.AddScoped<IUnitOfWork>(serviceProvider => serviceProvider.GetRequiredService<ApiDbContext>());
// Use AddEmailServices() instead of AddAzureEmailServices() to switch to the SmtpEmailService implementation.
builder.Services.AddAzureEmailServices(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHangfireServices(builder.Configuration);
builder.Services.AddHttpClient();
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddSwagger();

builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IUserFileService, UserFileService>();
builder.Services.AddScoped<IApprovalRequestService, ApprovalRequestService>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IUserFileRepository, UserFileRepository>();
builder.Services.AddScoped<IApprovalRequestRepository, ApprovalRequestRepository>();
builder.Services.AddScoped<IApprovalRequestTaskRepository, ApprovalRequestTaskRepository>();
builder.Services.AddScoped<IStoreService, StoreService>();

var app = builder.Build();

// Ensure the database is created. If the database already exists, this will do nothing.
// Changes to the database schema should be handled via EF Core migrations.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
    db.Database.EnsureCreated();
}

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
if (allowedOrigins is not null && allowedOrigins.Length > 0)
{
    app.UseCors(policy => policy.AllowAnyHeader()
        .AllowAnyMethod()
        .WithOrigins(allowedOrigins));
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHangfireDashboard();
}

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGroup("/api/account").MapIdentityApi<AppUser>();

app.Run();
