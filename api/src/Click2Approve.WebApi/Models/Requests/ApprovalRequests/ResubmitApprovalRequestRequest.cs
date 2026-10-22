namespace Click2Approve.WebApi.Models.Requests.ApprovalRequests;

/// <summary>
/// Represents a data transfer object required to resubmit an approval request.
/// </summary>
public class ResubmitApprovalRequestRequest
{
    /// <summary>Files attached to the approval request.</summary>
    public List<ApprovalRequestFileRequest> RequestFiles { get; set; } = [];
    /// <summary>Steps in the approval request.</summary>
    public List<ApprovalRequestStepRequest> Steps { get; set; } = [];
    /// <summary>Description of the approval request.</summary>
    public string? Description { get; set; }
}
