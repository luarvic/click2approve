using System.Net;
using System.Net.Http.Json;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebApi.Tests.ControllersTests;

/// <summary>Exercises workflow transitions through authenticated HTTP requests.</summary>
public sealed class ApprovalWorkflowTests(CustomWebApplicationFactory<Program> factory)
    : IClassFixture<CustomWebApplicationFactory<Program>>
{
    [Theory]
    [InlineData(ApprovalStepMode.Any, true)]
    [InlineData(ApprovalStepMode.All, true)]
    [InlineData(ApprovalStepMode.Any, false)]
    [InlineData(ApprovalStepMode.All, false)]
    public async Task MultiStep_AdvancesOnlyAfterRequiredApprovals(ApprovalStepMode mode, bool approve)
    {
        using var owner = await ApiTestSession.CreateAsync(factory.CreateClient());
        using var first = await ApiTestSession.CreateAsync(factory.CreateClient());
        using var second = await ApiTestSession.CreateAsync(factory.CreateClient());
        using var last = await ApiTestSession.CreateAsync(factory.CreateClient());
        var id = await owner.SubmitAsync(new
        {
            Title = "Two-step approval",
            RequestFiles = new[] { new { UserFileGlobalId = await owner.UploadAsync(), Sequence = 0 } },
            Steps = new[] { Step(1, mode, first.Email, second.Email), Step(2, ApprovalStepMode.All, last.Email) }
        });
        var initial = await ReadAsync(id);
        Assert.Equal(ApprovalRequestStatus.Pending, initial.Status);
        Assert.Empty(initial.Steps.Single(step => step.Sequence == 2).Tasks);
        // A future assignee has neither a task to complete nor requester access.
        Assert.Equal(HttpStatusCode.NotFound, (await last.Client.GetAsync($"{last.Root}/requests/{id}")).StatusCode);
        var tasks = initial.Steps.Single(step => step.Sequence == 1).Tasks;
        var firstTask = tasks.Single(task => task.AssigneeUser.Email == first.Email);
        var secondTask = tasks.Single(task => task.AssigneeUser.Email == second.Email);
        (await CompleteAsync(first, firstTask.GlobalId, approve)).EnsureSuccessStatusCode();
        var afterFirst = await ReadAsync(id);
        if (!approve)
        {
            Assert.Equal(ApprovalRequestStatus.Completed, afterFirst.Status);
            Assert.False(afterFirst.Result);
            Assert.NotNull(afterFirst.CompletedAt);
            Assert.Empty(afterFirst.Steps.Single(step => step.Sequence == 2).Tasks);
            Assert.Equal(ApprovalRequestTaskStatus.Skipped,
                afterFirst.Steps.SelectMany(step => step.Tasks).Single(task => task.GlobalId == secondTask.GlobalId).Status);
            Assert.Equal(HttpStatusCode.BadRequest, (await CompleteAsync(second, secondTask.GlobalId, true)).StatusCode);
            return;
        }
        Assert.Equal(ApprovalRequestStatus.Started, afterFirst.Status);
        if (mode == ApprovalStepMode.All)
        {
            Assert.Empty(afterFirst.Steps.Single(step => step.Sequence == 2).Tasks);
            (await CompleteAsync(second, secondTask.GlobalId, true)).EnsureSuccessStatusCode();
        }
        else
        {
            Assert.Equal(ApprovalRequestTaskStatus.Skipped,
                afterFirst.Steps.SelectMany(step => step.Tasks).Single(task => task.GlobalId == secondTask.GlobalId).Status);
        }
        var active = await ReadAsync(id);
        var lastTask = Assert.Single(active.Steps.Single(step => step.Sequence == 2).Tasks);
        (await last.Client.GetAsync($"{last.Root}/tasks/{lastTask.GlobalId}")).EnsureSuccessStatusCode();
        (await CompleteAsync(last, lastTask.GlobalId, true)).EnsureSuccessStatusCode();
        var completed = await ReadAsync(id);
        Assert.Equal(ApprovalRequestStatus.Completed, completed.Status);
        Assert.True(completed.Result);
        Assert.NotNull(completed.CompletedAt);
        Assert.Equal(HttpStatusCode.BadRequest, (await CompleteAsync(last, lastTask.GlobalId, true)).StatusCode);
        var replayed = await ReadAsync(id);
        Assert.Equal(completed.CompletedAt, replayed.CompletedAt);
        Assert.Equal(completed.Steps.Sum(step => step.Tasks.Count), replayed.Steps.Sum(step => step.Tasks.Count));
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Cancellation_StopsPendingWorkAndCannotBeReplayed(bool started)
    {
        using var owner = await ApiTestSession.CreateAsync(factory.CreateClient());
        using var first = await ApiTestSession.CreateAsync(factory.CreateClient());
        using var second = await ApiTestSession.CreateAsync(factory.CreateClient());
        var id = await owner.SubmitAsync(new
        {
            Title = "Cancellation",
            RequestFiles = new[] { new { UserFileGlobalId = await owner.UploadAsync(), Sequence = 0 } },
            Steps = new[] { Step(1, ApprovalStepMode.All, first.Email, second.Email) }
        });
        var initial = await ReadAsync(id);
        var tasks = Assert.Single(initial.Steps).Tasks;
        if (started)
            (await CompleteAsync(first, tasks.Single(task => task.AssigneeUser.Email == first.Email).GlobalId, true)).EnsureSuccessStatusCode();
        (await owner.Client.PostAsync($"{owner.Root}/requests/{id}/cancel", null)).EnsureSuccessStatusCode();
        var canceled = await ReadAsync(id);
        Assert.Equal(ApprovalRequestStatus.Canceled, canceled.Status);
        Assert.NotNull(canceled.CompletedAt);
        Assert.All(canceled.Steps.SelectMany(step => step.Tasks), task =>
            Assert.Equal(started && task.AssigneeUser.Email == first.Email
                ? ApprovalRequestTaskStatus.Completed : ApprovalRequestTaskStatus.Canceled, task.Status));
        var pending = tasks.Single(task => task.AssigneeUser.Email == second.Email);
        Assert.Equal(HttpStatusCode.BadRequest, (await CompleteAsync(second, pending.GlobalId, true)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await owner.Client.PostAsync($"{owner.Root}/requests/{id}/cancel", null)).StatusCode);
        Assert.Equal(canceled.CompletedAt, (await ReadAsync(id)).CompletedAt);
    }

    private async Task<ApprovalRequest> ReadAsync(Guid id)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        return await scope.ServiceProvider.GetRequiredService<ApiDbContext>().ApprovalRequests.AsNoTracking()
            .Include(request => request.Steps).ThenInclude(step => step.Tasks).ThenInclude(task => task.AssigneeUser)
            .SingleAsync(request => request.GlobalId == id);
    }

    private static object Step(int sequence, ApprovalStepMode mode, params string[] emails) => new
    {
        Sequence = sequence, Mode = mode, Action = ApprovalRequestTaskAction.Approve,
        Assignees = emails.Select(email => new { Type = AssigneeType.User, Email = email }).ToArray()
    };

    private static Task<HttpResponseMessage> CompleteAsync(ApiTestSession session, Guid id, bool result) =>
        session.Client.PostAsJsonAsync($"{session.Root}/tasks/complete", new
        {
            GlobalId = id, Result = result, Comment = result ? null : "Changes required"
        });
}
