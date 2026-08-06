using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Resolves approval assignees for email-only approval workflows.
/// </summary>
public class EmailOnlyAssigneeResolver(
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
        var assigneeUsers = new Dictionary<string, AppUser>();
        foreach (var email in assignees.Select(NormalizeEmailAssignee).Distinct())
        {
            assigneeUsers[email] = await _userProvisioningService.EnsureUserAsync(email, cancellationToken);
        }

        var tenantByEmail = (await _tenantRepository.ListPersonalAsync(assigneeUsers.Keys.ToList(), cancellationToken))
            .GroupBy(tenant => tenant.Owner.NormalizedEmail)
            .ToDictionary(group => group.Key!, group => group.First());

        return assignees.ToDictionary(
            assignee => assignee.Assignee,
            assignee => ResolveEmail(
                approvalRequest,
                assignee.Assignee,
                assigneeUsers[NormalizeEmailAssignee(assignee)],
                tenantByEmail));
    }

    public async Task<List<AssigneeResolution>> ResolveAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        ApprovalRequestStepAssignee assignee,
        CancellationToken cancellationToken)
    {
        var email = NormalizeEmailAssignee(assignee);
        var assigneeUser = await _userProvisioningService.EnsureUserAsync(email, cancellationToken);
        var assigneeTenant = await _tenantRepository.GetPersonalAsync(email, cancellationToken);
        var tenantByEmail = assigneeTenant is null
            ? []
            : new Dictionary<string, Tenant> { [email] = assigneeTenant };
        return ResolveEmail(approvalRequest, assignee, assigneeUser, tenantByEmail);
    }

    private static string NormalizeEmailAssignee(AssigneeResolveItem assignee)
    {
        return NormalizeEmailAssignee(assignee.Assignee, assignee.Email);
    }

    private static string NormalizeEmailAssignee(ApprovalRequestStepAssignee assignee, string? submittedEmail = null)
    {
        if (assignee.Type != AssigneeType.Email)
        {
            throw new BusinessRuleException("This product edition supports email assignees only.");
        }

        var email = EmailHelpers.NormalizeIdentityEmailKey(
            submittedEmail ?? assignee.User?.NormalizedEmail,
            "Assignee email is required.");
        assignee.UserId = null;
        var displayName = DisplayNameHelpers.NormalizeEmailForDisplay(email);
        assignee.AssigneeDisplayName = displayName;
        return email;
    }

    private static List<AssigneeResolution> ResolveEmail(
        ApprovalRequest approvalRequest,
        ApprovalRequestStepAssignee assignee,
        AppUser assigneeUser,
        Dictionary<string, Tenant> tenantByEmail)
    {
        var email = assigneeUser.NormalizedEmail!;
        assignee.User = assigneeUser;
        assignee.UserId = assigneeUser.Id;
        var displayName = assignee.AssigneeDisplayName ?? DisplayNameHelpers.NormalizeEmailForDisplay(email);
        tenantByEmail.TryGetValue(email, out var assigneeTenant);
        return
        [
            new AssigneeResolution(
                AssigneeUser: assigneeTenant?.Owner ?? assigneeUser,
                AssigneeEmployeeId: null,
                TenantId: assigneeTenant?.Id ?? approvalRequest.TenantId,
                AssigneeDisplayName: displayName)
        ];
    }
}
