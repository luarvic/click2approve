using System.Net;
using System.Net.Mail;
using api.Models;
using FluentEmail.Core.Interfaces;
using FluentEmail.Smtp;
using Microsoft.OpenApi.Models;

namespace api.Extensions;

// Extends IServiceCollection interface.
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication();
        services.AddAuthorization();
        services.AddIdentityApiEndpoints<AppUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = configuration.GetValue<int>("Identity:Password:RequiredLength");
                options.SignIn.RequireConfirmedEmail = true;
            })
            .AddEntityFrameworkStores<ApiDbContext>();
        return services;
    }

    public static void AddFluentEmail(this IServiceCollection services, IConfiguration configuration)
    {
        var emailSettings = configuration.GetSection("EmailSettings");
        var defaultFromEmail = emailSettings["DefaultFromEmail"];
        var host = emailSettings["Host"];
        var port = emailSettings.GetValue<int>("Port");
        services.AddFluentEmail(defaultFromEmail);
        var username = emailSettings["Username"];
        var password = emailSettings["Password"];
        services.AddSingleton<ISender>(x =>
            new SmtpSender(new SmtpClient(host, port)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential
                {
                    UserName = username,
                    Password = password
                }
            }));
    }

    public static void AddSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "Click2approve API Specification",
            });
            options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "ApiSpecification.XML"));
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter access token",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = "bearer"
            });
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
            });
        });
    }
}
