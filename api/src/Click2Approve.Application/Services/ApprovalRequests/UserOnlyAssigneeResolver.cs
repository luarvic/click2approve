using Click2Approve.Application.Extensions;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Resolves approval assignees for user-based approval workflows.
/// </summary>
public class UserOnlyAssigneeResolver(
    ITenantRepository tenantRepository,
    IUserProvisioningService userProvisioningService) : IAssigneeResolver
{
    private readonly ITenantRepository _tenantRepository = tenantRepository;
    private readonly IUserProvisioningService _userProvisioningService = userProvisioningService;

    public async Task<Dictionary<ApprovalRequestStepAssignee, List<AssigneeResolution>>> ResolveAsync(
        ApprovalRequest approvalRequest,
        IReadOnlyCollection<AssigneeResolveItem> assignees,
        CancellationToken cancellationToken)
    {
        var usersByEmail = new Dictionary<string, AppUser>();
        foreach (var email in assignees.Select(GetEmail).Distinct())
        {
            usersByEmail[email] = await _userProvisioningService.EnsureUserAsync(email, cancellationToken);
        }

        var tenantByOwnerId = (await _tenantRepository.ListPersonalAsync(
                [.. usersByEmail.Values.Select(user => user.Id)],
                cancellationToken))
            .ToDictionary(tenant => tenant.Owner.Id);

        return assignees.ToDictionary(
            assignee => assignee.Assignee,
            assignee => ResolveUser(
                approvalRequest,
                assignee.Assignee,
                usersByEmail[GetEmail(assignee)],
                tenantByOwnerId));
    }

    public async Task<List<AssigneeResolution>> ResolveAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        ApprovalRequestStepAssignee assignee,
        CancellationToken cancellationToken)
    {
        if (assignee.Type != AssigneeType.User || assignee.User is null)
        {
            throw new BusinessRuleException("This product edition supports user assignees only.");
        }

        var tenant = await _tenantRepository.GetPersonalAsync(assignee.User, cancellationToken);
        return ResolveUser(
            approvalRequest,
            assignee,
            assignee.User,
            tenant is null ? [] : new Dictionary<string, Tenant> { [assignee.User.Id] = tenant });
    }

    private static string GetEmail(AssigneeResolveItem assignee)
    {
        if (assignee.Assignee.Type != AssigneeType.User)
        {
            throw new BusinessRuleException("Assignee user is required.");
        }

        return EmailHelpers.NormalizeIdentityEmailKey(assignee.Email, "Assignee email is required.");
    }

    private static List<AssigneeResolution> ResolveUser(
        ApprovalRequest approvalRequest,
        ApprovalRequestStepAssignee assignee,
        AppUser assigneeUser,
        IReadOnlyDictionary<string, Tenant> tenantByOwnerId)
    {
        assignee.User = assigneeUser;
        assignee.UserId = assigneeUser.Id;
        assignee.AssigneeDisplayName = assigneeUser.NormalizedEmailOrEmpty();
        tenantByOwnerId.TryGetValue(assigneeUser.Id, out var assigneeTenant);
        return [new AssigneeResolution(
            assigneeTenant?.Owner ?? assigneeUser,
            null,
            assigneeTenant?.Id ?? approvalRequest.TenantId,
            assignee.AssigneeDisplayName)];
    }
}
