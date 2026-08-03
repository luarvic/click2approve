namespace Click2Approve.Application.Models.Auxiliary.ApprovalRequests;

public sealed record ApprovalRecipientResolution(
    string ApproverEmail,
    string? ApproverUserId,
    long? ApproverEmployeeId,
    long TenantId,
    string ApproverDisplayName,
    string? ApproverOrganizationDisplayName);
