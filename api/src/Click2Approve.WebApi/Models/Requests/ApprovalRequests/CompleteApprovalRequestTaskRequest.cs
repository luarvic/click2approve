namespace Click2Approve.WebApi.Models.Requests.ApprovalRequests;

/// <summary>
/// Represents a data transfer object required to complete an approval request task.
/// </summary>
public class CompleteApprovalRequestTaskRequest
{
    /// <summary>Global identifier of the approval task to complete.</summary>
    public required Guid GlobalId { get; set; }
    /// <summary>Outcome of the approval task, when available.</summary>
    public required bool Result { get; set; }
    /// <summary>Comment supplied for the task action.</summary>
    public string? Comment { get; set; }
    /// <summary>Legal name supplied by the assignee.</summary>
    public string? AssigneeLegalName { get; set; }
    /// <summary>Details of whom the assignee represents.</summary>
    public string? AssigneeRepresentationDetails { get; set; }
    /// <summary>Electronic signature data supplied by the assignee.</summary>
    public string? AssigneeSignatureJson { get; set; }
    /// <summary>IP address recorded for the assignee action.</summary>
    public string? AssigneeIpAddress { get; set; }
    /// <summary>Browser data recorded for the assignee action.</summary>
    public string? AssigneeBrowserData { get; set; }
    /// <summary>Client environment details recorded with the task action.</summary>
    public ApprovalRequestTaskClientAuditContextRequest? ClientAuditContext { get; set; }
}
