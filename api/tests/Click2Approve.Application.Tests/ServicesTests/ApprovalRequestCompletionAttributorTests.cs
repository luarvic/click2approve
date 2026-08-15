using Click2Approve.Application.Services.ApprovalRequests;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Tests.ServicesTests;

/// <summary>
/// Tests public approval request completion attribution.
/// </summary>
public class ApprovalRequestCompletionAttributorTests
{
    [Fact]
    public async Task AttributeAsync_ShouldUseEmailAsTheDisplayName()
    {
        var user = new AppUser
        {
            Id = 1,
            Email = "person@example.com",
            FirstName = "Person",
            LastName = "Example",
            NormalizedEmail = "person@example.com"
        };
        var approvalRequest = new ApprovalRequest
        {
            CreatedAt = DateTime.UtcNow,
            CreatedByDisplayName = "requester@example.com",
            CreatedByUser = user,
            CreatedByUserId = user.Id,
            Description = null,
            OrganizationDisplayName = "Personal",
            Status = ApprovalRequestStatus.Pending,
            TenantId = 1,
            Title = "Request"
        };

        await new ApprovalRequestCompletionAttributor().AttributeAsync(
            user,
            approvalRequest,
            CancellationToken.None);

        Assert.Equal("person@example.com", approvalRequest.CompletedByDisplayName);
    }
}
