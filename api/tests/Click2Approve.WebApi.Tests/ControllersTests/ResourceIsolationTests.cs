using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Tests.Extensions;
using Click2Approve.WebApi.Tests.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebApi.Tests.ControllersTests;

/// <summary>Verifies that known resource IDs do not grant access to unrelated personal users.</summary>
public sealed class ResourceIsolationTests(CustomWebApplicationFactory<Program> factory)
    : IClassFixture<CustomWebApplicationFactory<Program>>
{
    [Fact]
    public async Task UnrelatedUser_CannotReadCancelCompleteOrDownloadExistingResources()
    {
        using var owner = factory.CreateClient();
        using var assignee = factory.CreateClient();
        using var outsider = factory.CreateClient();
        var ownerSession = await SignInAsync(owner);
        var assigneeSession = await SignInAsync(assignee);
        var outsiderSession = await SignInAsync(outsider);
        var upload = Assert.Single(await owner.UploadTextFilesAsync(ownerSession.Token,
            new Dictionary<string, string> { ["confidential.txt"] = "Private request attachment" }, default));
        var title = $"Isolation-{Guid.NewGuid():N}";
        await owner.SubmitApprovalRequestAsync(ownerSession.Token, new SubmitApprovalRequestRequest
        {
            Title = title,
            RequestFiles = [new ApprovalRequestFileRequest { UserFileGlobalId = upload.GlobalId, Sequence = 0 }],
            Steps = [new ApprovalRequestStepRequest
            {
                Sequence = 1, Mode = ApprovalStepMode.Any, Action = ApprovalRequestTaskAction.Approve,
                Assignees = [new ApprovalRequestAssigneeRequest { Type = AssigneeType.User, Email = assigneeSession.Email }]
            }]
        }, default);
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        var request = await db.ApprovalRequests.Include(item => item.Steps).ThenInclude(step => step.Tasks)
            .SingleAsync(item => item.Title == title);
        var task = Assert.Single(Assert.Single(request.Steps).Tasks);
        var originalRequestStatus = request.Status;
        var originalTaskStatus = task.Status;

        // Positive controls prove the seeded resources are reachable through the authorized routes.
        (await owner.GetAsync($"api/v1/tenants/{ownerSession.Tenant}/requests/{request.GlobalId}")).EnsureSuccessStatusCode();
        (await assignee.GetAsync($"api/v1/tenants/{assigneeSession.Tenant}/tasks/{task.GlobalId}")).EnsureSuccessStatusCode();
        var attachment = await owner.DownloadApprovalRequestBase64Async(ownerSession.Token, upload.GlobalId, request.GlobalId, default);
        Assert.Equal(attachment, await assignee.DownloadApprovalRequestTaskBase64Async(
            assigneeSession.Token, upload.GlobalId, task.GlobalId, default));

        var root = $"api/v1/tenants/{outsiderSession.Tenant}";
        foreach (var path in new[]
        {
            $"requests/{request.GlobalId}", $"tasks/{task.GlobalId}",
            $"requests/{request.GlobalId}/attachments/{upload.GlobalId}/downloadBase64",
            $"tasks/{task.GlobalId}/requestAttachments/{upload.GlobalId}/downloadBase64"
        })
        {
            using var response = await outsider.GetAsync($"{root}/{path}");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
        Assert.Equal(HttpStatusCode.NotFound,
            (await outsider.PostAsync($"{root}/requests/{request.GlobalId}/cancel", null)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await outsider.PostAsJsonAsync($"{root}/tasks/complete", new { GlobalId = task.GlobalId, Result = true })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await outsider.DeleteAsync($"{root}/files/{upload.GlobalId}")).StatusCode);

        await db.Entry(request).ReloadAsync();
        await db.Entry(task).ReloadAsync();
        Assert.Equal(originalRequestStatus, request.Status);
        Assert.Equal(originalTaskStatus, task.Status);
        Assert.Equal(attachment, await owner.DownloadApprovalRequestBase64Async(
            ownerSession.Token, upload.GlobalId, request.GlobalId, default));
    }

    private static async Task<(string Email, string Token, Guid Tenant)> SignInAsync(HttpClient client)
    {
        var credentials = new Credentials { Email = $"isolation-{Guid.NewGuid():N}@example.com", Password = "ZAQ12wsx!" };
        await client.RegisterAsync(credentials, default);
        var login = await client.LogInAsync(credentials, default);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login.AccessToken);
        var tenant = await client.GetCurrentTenantIdAsync(login.AccessToken, default);
        return (credentials.Email, login.AccessToken, tenant);
    }
}
