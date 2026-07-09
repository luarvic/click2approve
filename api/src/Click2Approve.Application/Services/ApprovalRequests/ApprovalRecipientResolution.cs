namespace Click2Approve.Application.Services.ApprovalRequests;

public sealed record ApprovalRecipientResolution(
    string ApproverEmail,
    string? ApproverUserId,
    long TenantId,
    string? DisplayName,
    bool CanViewRequest);
