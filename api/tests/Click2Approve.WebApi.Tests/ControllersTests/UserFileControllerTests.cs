using System.Net;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebApi.Tests.ControllersTests;

/// <summary>Tests upload, resource-authorized download, and deletion independently.</summary>
public sealed class UserFileControllerTests(CustomWebApplicationFactory<Program> factory)
    : IClassFixture<CustomWebApplicationFactory<Program>>
{
    [Theory]
    [InlineData("POST", "files/upload")]
    [InlineData("GET", "requests/00000000-0000-0000-0000-000000000002/attachments/00000000-0000-0000-0000-000000000003/downloadBase64")]
    [InlineData("GET", "tasks/00000000-0000-0000-0000-000000000003/requestAttachments/00000000-0000-0000-0000-000000000004/downloadBase64")]
    [InlineData("DELETE", "files/00000000-0000-0000-0000-000000000002")]
    public async Task AnonymousRequests_ReturnUnauthorized(string method, string path)
    {
        using var client = factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Parse(method), $"api/v1/tenants/{Guid.NewGuid()}/{path}");
        using var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task MissingResources_ReturnNotFound()
    {
        using var session = await ApiTestSession.CreateAsync(factory.CreateClient());
        var missing = Guid.NewGuid();
        Assert.Equal(HttpStatusCode.NotFound, (await session.Client.DeleteAsync($"{session.Root}/files/{missing}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await session.Client.GetAsync($"{session.Root}/requests/{missing}/attachments/{missing}/downloadBase64")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await session.Client.GetAsync($"{session.Root}/tasks/{missing}/requestAttachments/{missing}/downloadBase64")).StatusCode);
    }

    [Fact]
    public async Task Upload_PersistsOwnedPrivateFileAndSchedulesUnattachedCleanup()
    {
        using var session = await ApiTestSession.CreateAsync(factory.CreateClient());
        var fileId = await session.UploadAsync();
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        var file = await db.UserFiles.Include(item => item.Owner).Include(item => item.Tenant)
            .SingleAsync(item => item.GlobalId == fileId);
        Assert.Equal(session.Email, file.Owner.Email);
        Assert.Equal(session.TenantId, file.Tenant.GlobalId);
        Assert.Equal(UserFileStorageType.Private, file.StorageType);
        Assert.Equal(UserFileStatus.Uploaded, file.Status);
        Assert.Equal("approval.txt", file.Name);
        Assert.True(file.Size > 0);
        Assert.True(file.ScheduledForDeletionAt > file.CreatedAt);
    }

    [Fact]
    public async Task UnattachedDelete_RequiresOwnershipAndRemovesOnlyTheSelectedFile()
    {
        using var owner = await ApiTestSession.CreateAsync(factory.CreateClient());
        using var outsider = await ApiTestSession.CreateAsync(factory.CreateClient());
        var file = await owner.UploadAsync();
        var retained = await owner.UploadAsync();
        Assert.Equal(HttpStatusCode.NotFound, (await outsider.Client.DeleteAsync($"{outsider.Root}/files/{file}")).StatusCode);
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        Assert.True(await db.UserFiles.AnyAsync(item => item.GlobalId == file));
        (await owner.Client.DeleteAsync($"{owner.Root}/files/{file}")).EnsureSuccessStatusCode();
        Assert.False(await db.UserFiles.AnyAsync(item => item.GlobalId == file));
        Assert.True(await db.UserFiles.AnyAsync(item => item.GlobalId == retained));
        Assert.Equal(HttpStatusCode.NotFound, (await owner.Client.DeleteAsync($"{owner.Root}/files/{file}")).StatusCode);
    }

    [Fact]
    public async Task Download_UsesRequestAccessAndRejectsFilesOutsideTheRequest()
    {
        using var owner = await ApiTestSession.CreateAsync(factory.CreateClient());
        using var assignee = await ApiTestSession.CreateAsync(factory.CreateClient());
        var file = await owner.UploadAsync();
        var unrelated = await owner.UploadAsync();
        var request = await owner.SubmitAsync(Payload(file, assignee.Email));
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        var task = await db.ApprovalRequestTasks.SingleAsync(item => item.ApprovalRequest.GlobalId == request);
        var expected = "data:text/plain;base64," + Convert.ToBase64String("Approval document"u8.ToArray());
        Assert.Equal(expected, await owner.Client.GetStringAsync($"{owner.Root}/requests/{request}/attachments/{file}/downloadBase64"));
        Assert.Equal(expected, await assignee.Client.GetStringAsync($"{assignee.Root}/tasks/{task.GlobalId}/requestAttachments/{file}/downloadBase64"));
        Assert.Equal(HttpStatusCode.NotFound,
            (await assignee.Client.GetAsync($"{assignee.Root}/tasks/{task.GlobalId}/requestAttachments/{unrelated}/downloadBase64")).StatusCode);
        // Attachments added after task creation remain visible through the authorized request.
        db.ApprovalRequestFiles.Add(new ApprovalRequestFile
        {
            ApprovalRequestId = task.ApprovalRequestId,
            UserFileId = (await db.UserFiles.SingleAsync(item => item.GlobalId == unrelated)).Id,
            Sequence = 1, RevisionAction = ApprovalRequestFileRevisionAction.Unchanged
        });
        await db.SaveChangesAsync();
        Assert.Equal(expected, await assignee.Client.GetStringAsync($"{assignee.Root}/tasks/{task.GlobalId}/requestAttachments/{unrelated}/downloadBase64"));
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task AttachedDelete_ReturnsBusinessErrorAndPreservesMetadataAndBytes(bool staleStatus)
    {
        using var owner = await ApiTestSession.CreateAsync(factory.CreateClient());
        using var assignee = await ApiTestSession.CreateAsync(factory.CreateClient());
        var file = await owner.UploadAsync();
        var request = await owner.SubmitAsync(Payload(file, assignee.Email));
        var download = $"{owner.Root}/requests/{request}/attachments/{file}/downloadBase64";
        var before = await owner.Client.GetStringAsync(download);
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        var row = await db.UserFiles.SingleAsync(item => item.GlobalId == file);
        if (staleStatus)
        {
            row.Status = UserFileStatus.Uploaded;
            await db.SaveChangesAsync();
        }
        using var response = await owner.Client.DeleteAsync($"{owner.Root}/files/{file}");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.True(await db.UserFiles.AnyAsync(item => item.GlobalId == file));
        Assert.True(await db.ApprovalRequestFiles.AnyAsync(item => item.UserFileId == row.Id));
        Assert.Equal(before, await owner.Client.GetStringAsync(download));
    }

    private static object Payload(Guid file, string email) => new
    {
        Title = "File access approval", RequestFiles = new[] { new { UserFileGlobalId = file, Sequence = 0 } },
        Steps = new[] { new { Sequence = 1, Mode = ApprovalStepMode.Any, Action = ApprovalRequestTaskAction.Approve,
            Assignees = new[] { new { Type = AssigneeType.User, Email = email } } } }
    };
}
