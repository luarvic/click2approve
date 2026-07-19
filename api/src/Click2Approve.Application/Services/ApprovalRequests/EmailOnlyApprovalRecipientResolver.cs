using Click2Approve.Application.Helpers;
using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

public class EmailOnlyApprovalRecipientResolver(ITenantRepository tenantRepository) : IApprovalRecipientResolver
{
    private readonly ITenantRepository _tenantRepository = tenantRepository;

    public async Task<List<ApprovalRecipientResolution>> ResolveAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        ApprovalRequestStepApprover approver,
        CancellationToken cancellationToken)
    {
        if (approver.Type != ApprovalRecipientType.Email)
        {
            throw new BusinessRuleException("This product edition supports email approvers only.");
        }

        var email = EmailHelpers.NormalizeIdentityEmailKey(
            approver.Email,
            "Approver email is required.");
        approver.Email = email;
        approver.DisplayName ??= EmailHelpers.NormalizeEmailAddress(email);
        var approverTenant = await _tenantRepository.GetPersonalAsync(email, cancellationToken);
        return
        [
            new ApprovalRecipientResolution(
                email,
                approverTenant?.Owner.Id,
                ApproverEmployeeId: null,
                approverTenant?.Id ?? approvalRequest.TenantId,
                approver.DisplayName,
                approver.CanViewRequest)
        ];
    }
}
