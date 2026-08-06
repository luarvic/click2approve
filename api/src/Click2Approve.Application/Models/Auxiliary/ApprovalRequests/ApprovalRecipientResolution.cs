using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Auxiliary.ApprovalRequests;

/// <summary>
/// Describes a resolved approval request recipient.
/// </summary>
public sealed record ApprovalRecipientResolution(
    AppUser ApproverUser,
    long? ApproverEmployeeId,
    long TenantId,
    string ApproverDisplayName);
