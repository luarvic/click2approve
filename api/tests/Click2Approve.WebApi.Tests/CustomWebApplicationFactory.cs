using System.Data.Common;
using Click2Approve.WebApi.Persistence;
using Click2Approve.WebApi.Services;
using Click2Approve.WebApi.Services.StoreService;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Click2Approve.WebApi.Tests;

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
            services.RemoveAll<DbContextOptions<ApiDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<ApiDbContext>>();
            services.RemoveAll<ApiDbContext>();
            services.RemoveAll<IDatabaseProvider>();

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
            services.RemoveAll<IStoreService>();
            services.AddSingleton<IStoreService, MockStoreService>();
        });
    }
}
