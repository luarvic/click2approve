using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Resolves approval recipients for email-only approval workflows.
/// </summary>
public class EmailOnlyApprovalRecipientResolver(
    ITenantRepository tenantRepository,
    IUserProvisioningService userProvisioningService) : IApprovalRecipientResolver
{
    private readonly ITenantRepository _tenantRepository = tenantRepository;
    private readonly IUserProvisioningService _userProvisioningService = userProvisioningService;

    public async Task<Dictionary<ApprovalRequestStepApprover, List<ApprovalRecipientResolution>>> ResolveAsync(
        ApprovalRequest approvalRequest,
        IReadOnlyCollection<ApprovalRecipientResolveItem> approvers,
        CancellationToken cancellationToken)
    {
        var approverUsers = new Dictionary<string, AppUser>();
        foreach (var email in approvers.Select(NormalizeEmailApprover).Distinct())
        {
            approverUsers[email] = await _userProvisioningService.EnsureUserAsync(email, cancellationToken);
        }

        var tenantByEmail = (await _tenantRepository.ListPersonalAsync(approverUsers.Keys.ToList(), cancellationToken))
            .GroupBy(tenant => tenant.Owner.NormalizedEmail)
            .ToDictionary(group => group.Key!, group => group.First());

        return approvers.ToDictionary(
            approver => approver.Approver,
            approver => ResolveEmail(
                approvalRequest,
                approver.Approver,
                approverUsers[NormalizeEmailApprover(approver)],
                tenantByEmail));
    }

    public async Task<List<ApprovalRecipientResolution>> ResolveAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        ApprovalRequestStepApprover approver,
        CancellationToken cancellationToken)
    {
        var email = NormalizeEmailApprover(approver);
        var approverUser = await _userProvisioningService.EnsureUserAsync(email, cancellationToken);
        var approverTenant = await _tenantRepository.GetPersonalAsync(email, cancellationToken);
        var tenantByEmail = approverTenant is null
            ? []
            : new Dictionary<string, Tenant> { [email] = approverTenant };
        return ResolveEmail(approvalRequest, approver, approverUser, tenantByEmail);
    }

    private static string NormalizeEmailApprover(ApprovalRecipientResolveItem approver)
    {
        return NormalizeEmailApprover(approver.Approver, approver.Email);
    }

    private static string NormalizeEmailApprover(ApprovalRequestStepApprover approver, string? submittedEmail = null)
    {
        if (approver.Type != ApprovalRecipientType.Email)
        {
            throw new BusinessRuleException("This product edition supports email approvers only.");
        }

        var email = EmailHelpers.NormalizeIdentityEmailKey(
            submittedEmail ?? approver.User?.NormalizedEmail,
            "Approver email is required.");
        approver.UserId = null;
        var displayName = DisplayNameHelpers.NormalizeEmailForDisplay(email);
        approver.ApproverDisplayName = displayName;
        return email;
    }

    private static List<ApprovalRecipientResolution> ResolveEmail(
        ApprovalRequest approvalRequest,
        ApprovalRequestStepApprover approver,
        AppUser approverUser,
        Dictionary<string, Tenant> tenantByEmail)
    {
        var email = approverUser.NormalizedEmail!;
        approver.User = approverUser;
        approver.UserId = approverUser.Id;
        var displayName = approver.ApproverDisplayName ?? DisplayNameHelpers.NormalizeEmailForDisplay(email);
        tenantByEmail.TryGetValue(email, out var approverTenant);
        return
        [
            new ApprovalRecipientResolution(
                ApproverUser: approverTenant?.Owner ?? approverUser,
                ApproverEmployeeId: null,
                TenantId: approverTenant?.Id ?? approvalRequest.TenantId,
                ApproverDisplayName: displayName,
                ApproverOrganizationDisplayName: approverTenant?.BusinessName)
        ];
    }
}
