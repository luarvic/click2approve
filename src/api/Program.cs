using api.Extensions;
using api.Models;
using api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddCors();
// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Version = "v1",
        Title = "File Manager API Specification",
        Description = "An API that manages user accounts and files.",
    });
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "ApiSpecification.XML"));
});
builder.Services.AddHttpClient();
builder.Services.AddDbContext<FileManagerDbContext>();
builder.Services.AddTransient<IFileService, FileService>();
builder.Services.AddSingleton<IStoreService, StoreService>();
builder.Services.AddTransient<IAccountService, AccountService>();
builder.Services.AddTransient<ITokenService, TokenService>();
var app = builder.Build();

// Create the database and schema.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FileManagerDbContext>();
    db.Database.EnsureCreated();
    db.Database.Migrate();
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
}
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
