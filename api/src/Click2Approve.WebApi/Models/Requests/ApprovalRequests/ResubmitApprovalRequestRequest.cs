namespace Click2Approve.WebApi.Models.Requests.ApprovalRequests;

/// <summary>
/// Represents a data transfer object required to resubmit an approval request.
/// </summary>
public class ResubmitApprovalRequestRequest
{
    public List<ApprovalRequestFileRequest> RequestFiles { get; set; } = [];
    public List<ApprovalRequestStepRequest> Steps { get; set; } = [];
    public string? Description { get; set; }
}
