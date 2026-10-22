namespace Click2Approve.WebApi.Models.Requests.ApprovalRequests;

/// <summary>
/// Represents a data transfer object required to submit an approval request.
/// </summary>
public class SubmitApprovalRequestRequest
{
    /// <summary>Title of the approval request or task.</summary>
    public required string Title { get; set; }
    /// <summary>Global identifier of the previous request revision.</summary>
    public Guid? PreviousRevisionApprovalRequestGlobalId { get; set; }
    /// <summary>Files attached to the approval request.</summary>
    public List<ApprovalRequestFileRequest> RequestFiles { get; set; } = [];
    /// <summary>Steps in the approval request.</summary>
    public List<ApprovalRequestStepRequest> Steps { get; set; } = [];
    /// <summary>Description of the approval request.</summary>
    public string? Description { get; set; }
}
