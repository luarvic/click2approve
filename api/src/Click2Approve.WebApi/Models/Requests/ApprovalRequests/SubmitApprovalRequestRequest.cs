namespace Click2Approve.WebApi.Models.Requests.ApprovalRequests;

/// <summary>
/// Represents a data transfer object required to submit an approval request.
/// </summary>
public class SubmitApprovalRequestRequest
{
    public required string Title { get; set; }
    public Guid? PreviousRevisionApprovalRequestGlobalId { get; set; }
    public List<ApprovalRequestFileRequest> RequestFiles { get; set; } = [];
    public List<ApprovalRequestStepRequest> Steps { get; set; } = [];
    public string? Description { get; set; }
}
