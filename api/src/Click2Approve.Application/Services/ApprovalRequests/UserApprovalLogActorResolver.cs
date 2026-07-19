using Click2Approve.Application.Helpers;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Resolves approval log actors as application users.
/// </summary>
public class UserApprovalLogActorResolver : IApprovalLogActorResolver
{
    public Task<ApprovalLogActor> ResolveAsync(AppUser user, long tenantId, CancellationToken cancellationToken)
    {
        return Task.FromResult(new ApprovalLogActor(
            Type: ApprovalLogActorType.User,
            UserId: user.Id,
            EmployeeId: null,
            Email: user.NormalizedEmail ?? user.Email ?? string.Empty,
            DisplayName: DisplayNameHelpers.FormatUser(user)));
    }
}
