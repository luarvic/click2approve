using System.Text.Json.Serialization;
using Click2Approve.WebAPI.Extensions;
using Click2Approve.WebAPI.Middlewares;
using Click2Approve.WebAPI.Models;
using Click2Approve.WebAPI.Services.ApprovalRequestService;
using Click2Approve.WebAPI.Services.AuditLogService;
using Click2Approve.WebAPI.Services.StoreService;
using Click2Approve.WebAPI.Services.UserFileService;
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
    options.UseMySql(builder.Configuration.GetConnectionString("Default"),
        ServerVersion.AutoDetect(connectionString));
});
builder.Services.AddTransient<IAuditLogService, AuditLogService>();
builder.Services.AddTransient<IUserFileService, UserFileService>();
builder.Services.AddTransient<IApprovalRequestService, ApprovalRequestService>();
builder.Services.AddTransient<IStoreService, StoreService>();
builder.Services.AddEmailServices(builder.Configuration);
var app = builder.Build();

// Create the database and schema.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
    db.Database.EnsureCreated();
}

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
if (allowedOrigins is not null && allowedOrigins.Length > 0)
{
    app.UseCors(policy => policy.AllowAnyHeader()
        .AllowAnyMethod()
        .WithOrigins(allowedOrigins));
}

// Configure the HTTP request pipeline.
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

// This declaration is required for integration tests.
public partial class Program { }
