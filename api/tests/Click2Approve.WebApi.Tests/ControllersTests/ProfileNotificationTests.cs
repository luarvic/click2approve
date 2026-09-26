using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebApi.Tests.ControllersTests;

/// <summary>Checks profile validation and recipient-scoped notification mutations through HTTP.</summary>
public sealed class ProfileNotificationTests(CustomWebApplicationFactory<Program> factory)
    : IClassFixture<CustomWebApplicationFactory<Program>>
{
    [Fact]
    public async Task Profile_ValidatesAndPersistsOnlyTheAuthenticatedUsersChanges()
    {
        using var user = await ApiTestSession.CreateAsync(factory.CreateClient());
        using var other = await ApiTestSession.CreateAsync(factory.CreateClient());
        using var anonymous = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("api/v1/userProfiles")).StatusCode);
        using var updated = await user.Client.PutAsJsonAsync("api/v1/userProfiles", new
        {
            FirstName = "Ada", LastName = "Lovelace", NotificationPreferences = Array.Empty<object>()
        });
        updated.EnsureSuccessStatusCode();
        var profile = await user.Client.GetFromJsonAsync<JsonElement>("api/v1/userProfiles");
        Assert.Equal("Ada", profile.GetProperty("firstName").GetString());
        Assert.Equal("Lovelace", profile.GetProperty("lastName").GetString());
        var otherProfile = await other.Client.GetFromJsonAsync<JsonElement>("api/v1/userProfiles");
        Assert.NotEqual("Ada", otherProfile.GetProperty("firstName").GetString());
        Assert.Equal(HttpStatusCode.BadRequest, (await user.Client.PutAsJsonAsync("api/v1/userProfiles", new
        {
            FirstName = new string('x', 1000), NotificationPreferences = Array.Empty<object>()
        })).StatusCode);
        Assert.Equal("Ada", (await user.Client.GetFromJsonAsync<JsonElement>("api/v1/userProfiles")).GetProperty("firstName").GetString());
    }

    [Fact]
    public async Task Notifications_MutationsAreRecipientScopedAndValidateSelection()
    {
        using var recipient = await ApiTestSession.CreateAsync(factory.CreateClient());
        using var other = await ApiTestSession.CreateAsync(factory.CreateClient());
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        var notification = new InAppNotification
        {
            TenantId = (await db.Tenants.SingleAsync(item => item.GlobalId == recipient.TenantId)).Id,
            UserId = (await db.Users.SingleAsync(item => item.Email == recipient.Email)).Id,
            EventId = Guid.NewGuid(), OccurredAt = DateTime.UtcNow, Summary = "Private notification",
            Type = NotificationType.ApprovalRequestTaskCreated
        };
        db.InAppNotifications.Add(notification);
        await db.SaveChangesAsync();
        Assert.Equal(1, await recipient.Client.GetFromJsonAsync<long>($"{recipient.Root}/notifications/unread/count"));
        Assert.Equal(0, await other.Client.GetFromJsonAsync<long>($"{other.Root}/notifications/unread/count"));
        Assert.Equal(HttpStatusCode.NotFound,
            (await other.Client.PostAsync($"{other.Root}/notifications/{notification.GlobalId}/read", null)).StatusCode);
        await db.Entry(notification).ReloadAsync();
        Assert.Null(notification.ReadAt);
        Assert.Equal(HttpStatusCode.BadRequest, (await recipient.Client.PostAsJsonAsync(
            $"{recipient.Root}/notifications/readSelected", new { NotificationGlobalIds = Array.Empty<Guid>() })).StatusCode);
        (await recipient.Client.PostAsJsonAsync($"{recipient.Root}/notifications/readSelected",
            new { NotificationGlobalIds = new[] { notification.GlobalId } })).EnsureSuccessStatusCode();
        Assert.Equal(0, await recipient.Client.GetFromJsonAsync<long>($"{recipient.Root}/notifications/unread/count"));
        using var delete = new HttpRequestMessage(HttpMethod.Delete, $"{recipient.Root}/notifications")
        {
            Content = JsonContent.Create(new { NotificationGlobalIds = new[] { notification.GlobalId } })
        };
        (await recipient.Client.SendAsync(delete)).EnsureSuccessStatusCode();
        Assert.False(await db.InAppNotifications.AnyAsync(item => item.GlobalId == notification.GlobalId));
    }
}
