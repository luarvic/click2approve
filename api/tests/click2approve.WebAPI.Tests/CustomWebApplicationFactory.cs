using click2approve.WebAPI.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace click2approve.WebAPI.Tests;

/// <summary>
/// Represents a custom web application factory that mocks infrastructure (e.g. database, file system, etc.).
/// </summary>
public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Test");
        builder.ConfigureServices(services =>
        {
            // Replace MySQL DB context with SQLite.
            var dbContextOptionsDescriptor = services.Single(
                d => d.ServiceType ==
                    typeof(DbContextOptions<ApiDbContext>));
            services.Remove(dbContextOptionsDescriptor);

            var dbContextDescriptor = services.Single(
                d => d.ServiceType ==
                    typeof(ApiDbContext));
            services.Remove(dbContextDescriptor);

            services.AddDbContext<ApiDbContext>(builder =>
            {
                builder.UseSqlite(new SqliteConnection("DataSource=:memory:"));
            }, ServiceLifetime.Singleton);
        });
    }
}
