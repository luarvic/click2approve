using Click2Approve.Application.Extensions;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.ApprovalRequests;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Resolves approval assignees for user-based approval workflows.
/// </summary>
public class UserOnlyAssigneeResolver(
    ITenantRepository tenantRepository,
    IUserProvisioningService userProvisioningService,
    ITenantService tenantService) : IAssigneeResolver
{
    private readonly ITenantRepository _tenantRepository = tenantRepository;
    private readonly IUserProvisioningService _userProvisioningService = userProvisioningService;
    private readonly ITenantService _tenantService = tenantService;

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
        foreach (var user in usersByEmail.Values.Where(user => !tenantByOwnerId.ContainsKey(user.Id)))
        {
            tenantByOwnerId[user.Id] = await _tenantService.GetRequiredDefaultAsync(user, cancellationToken);
        }

        return assignees.ToDictionary(
            assignee => assignee.Assignee,
            assignee => ResolveUser(
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

        var tenant = await _tenantService.GetRequiredDefaultAsync(assignee.User, cancellationToken);
        return ResolveUser(
            assignee,
            assignee.User,
            new Dictionary<long, Tenant> { [assignee.User.Id] = tenant });
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
        ApprovalRequestStepAssignee assignee,
        AppUser assigneeUser,
        Dictionary<long, Tenant> tenantByOwnerId)
    {
        assignee.User = assigneeUser;
        assignee.UserId = assigneeUser.Id;
        assignee.AssigneeDisplayName = assigneeUser.FormatParticipantDisplayName();
        var assigneeTenant = tenantByOwnerId[assigneeUser.Id];
        return [new AssigneeResolution(
            assigneeTenant.Owner,
            null,
            assigneeTenant.Id,
            assignee.AssigneeDisplayName)];
    }
}
