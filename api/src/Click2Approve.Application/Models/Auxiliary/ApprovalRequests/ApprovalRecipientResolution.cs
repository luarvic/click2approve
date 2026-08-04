using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Auxiliary.ApprovalRequests;

public sealed record ApprovalRecipientResolution(
    AppUser ApproverUser,
    long? ApproverEmployeeId,
    long TenantId,
    string ApproverDisplayName,
    string? ApproverOrganizationDisplayName);
