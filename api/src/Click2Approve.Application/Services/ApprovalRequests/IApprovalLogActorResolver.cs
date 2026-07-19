using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Resolves the current approval log actor for a tenant scoped operation.
/// </summary>
public interface IApprovalLogActorResolver
{
    Task<ApprovalLogActor> ResolveAsync(AppUser user, long tenantId, CancellationToken cancellationToken);
}
