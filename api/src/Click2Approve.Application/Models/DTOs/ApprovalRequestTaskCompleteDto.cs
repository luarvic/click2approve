using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents a data transfer object required to complete an approval request task.
/// </summary>
public class ApprovalRequestTaskCompleteDto
{
    public required Guid GlobalId { get; set; }
    public required bool Result { get; set; }
    public string? Comment { get; set; }
    public string? ApproverLegalName { get; set; }
    public string? ApproverSignatureJson { get; set; }
    public string? ApproverIpAddress { get; set; }
    public string? ApproverBrowserData { get; set; }
    public ApprovalRequestTaskClientAuditContextDto? ClientAuditContext { get; set; }
}
