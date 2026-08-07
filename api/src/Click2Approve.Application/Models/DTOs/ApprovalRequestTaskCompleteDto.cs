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
    public string? AssigneeLegalName { get; set; }
    public string? AssigneeOrganization { get; set; }
    public string? AssigneeSignatureJson { get; set; }
    public string? AssigneeIpAddress { get; set; }
    public string? AssigneeBrowserData { get; set; }
    public ApprovalRequestTaskClientAuditContextDto? ClientAuditContext { get; set; }
}
