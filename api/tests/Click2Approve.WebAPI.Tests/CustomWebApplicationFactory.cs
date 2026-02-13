using System.Data.Common;
using Click2Approve.WebAPI.Models;
using Click2Approve.WebAPI.Services;
using Click2Approve.WebAPI.Services.StoreService;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebAPI.Tests;

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
                s => s.ServiceType ==
                    typeof(DbContextOptions<ApiDbContext>));
            services.Remove(dbContextOptionsDescriptor);

            var dbContextDescriptor = services.Single(
                s => s.ServiceType ==
                    typeof(ApiDbContext));
            services.Remove(dbContextDescriptor);

            // Create open SqliteConnection so EF won't automatically close it.
            services.AddSingleton<DbConnection>(container =>
            {
                var connection = new SqliteConnection("DataSource=:memory:");
                connection.Open();
                return connection;
            });

            services.AddDbContext<ApiDbContext>((container, options) =>
            {
                var connection = container.GetRequiredService<DbConnection>();
                options.UseSqlite(connection);
            });

            // Replace StoreService with MockStoreService.
            var storeServiceDescriptor = services.Single(s => s.ServiceType == typeof(IStoreService));
            services.Remove(storeServiceDescriptor);
            services.AddSingleton<IStoreService, MockStoreService>();
        });
    }
}
