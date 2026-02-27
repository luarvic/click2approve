using System.Text.Json.Serialization;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Middlewares;
using Click2Approve.WebApi.Models;
using Click2Approve.WebApi.Persistence;
using Click2Approve.WebApi.Services.ApprovalRequestService;
using Click2Approve.WebApi.Services.AuditLogService;
using Click2Approve.WebApi.Services.StoreService;
using Click2Approve.WebApi.Services.UserFileService;
using Hangfire;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddHangfireServices(builder.Configuration);
builder.Services.AddCors();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwagger();
builder.Services.AddHttpClient();
builder.Services.AddDbContext<ApiDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Default");
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IUserFileService, UserFileService>();
builder.Services.AddScoped<IApprovalRequestService, ApprovalRequestService>();
builder.Services.AddScoped<IStoreService, StoreService>();
builder.Services.AddEmailServices(builder.Configuration);
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
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGroup("/api/account").MapIdentityApi<AppUser>();
app.Run();
