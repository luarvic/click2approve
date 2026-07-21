using Click2Approve.Application.Helpers;
using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

public class EmailOnlyApprovalRecipientResolver(ITenantRepository tenantRepository) : IApprovalRecipientResolver
{
    private readonly ITenantRepository _tenantRepository = tenantRepository;

    public async Task<Dictionary<ApprovalRequestStepApprover, List<ApprovalRecipientResolution>>> ResolveAsync(
        ApprovalRequest approvalRequest,
        IReadOnlyCollection<ApprovalRecipientResolveItem> approvers,
        CancellationToken cancellationToken)
    {
        var emails = approvers.Select(NormalizeEmailApprover).Distinct().ToList();
        var tenantByEmail = (await _tenantRepository.ListPersonalAsync(emails, cancellationToken))
            .GroupBy(tenant => tenant.Owner.NormalizedEmail)
            .ToDictionary(group => group.Key!, group => group.First());

        return approvers.ToDictionary(
            approver => approver.Approver,
            approver => ResolveEmail(approvalRequest, approver.Approver, tenantByEmail));
    }

    public async Task<List<ApprovalRecipientResolution>> ResolveAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        ApprovalRequestStepApprover approver,
        CancellationToken cancellationToken)
    {
        var email = NormalizeEmailApprover(approver);
        var approverTenant = await _tenantRepository.GetPersonalAsync(email, cancellationToken);
        var tenantByEmail = approverTenant is null
            ? []
            : new Dictionary<string, Tenant> { [email] = approverTenant };
        return ResolveEmail(approvalRequest, approver, tenantByEmail);
    }

    private static string NormalizeEmailApprover(ApprovalRecipientResolveItem approver)
    {
        return NormalizeEmailApprover(approver.Approver);
    }

    private static string NormalizeEmailApprover(ApprovalRequestStepApprover approver)
    {
        if (approver.Type != ApprovalRecipientType.Email)
        {
            throw new BusinessRuleException("This product edition supports email approvers only.");
        }

        var email = EmailHelpers.NormalizeIdentityEmailKey(
            approver.Email,
            "Approver email is required.");
        approver.Email = email;
        var displayName = DisplayNameHelpers.NormalizeEmailForDisplay(email);
        approver.ApproverDisplayName = displayName;
        return email;
    }

    private static List<ApprovalRecipientResolution> ResolveEmail(
        ApprovalRequest approvalRequest,
        ApprovalRequestStepApprover approver,
        IReadOnlyDictionary<string, Tenant> tenantByEmail)
    {
        var email = approver.Email!;
        var displayName = approver.ApproverDisplayName ?? DisplayNameHelpers.NormalizeEmailForDisplay(email);
        tenantByEmail.TryGetValue(email, out var approverTenant);
        return
        [
            new ApprovalRecipientResolution(
                email,
                approverTenant?.Owner.Id,
                ApproverEmployeeId: null,
                approverTenant?.Id ?? approvalRequest.TenantId,
                displayName,
                approver.CanViewRequest)
        ];
    }
}
