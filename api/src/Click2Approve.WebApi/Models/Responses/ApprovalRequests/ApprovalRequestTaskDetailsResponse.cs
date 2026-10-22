using System.Diagnostics.CodeAnalysis;

namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents the full task data required by an approval task editor.
/// </summary>
public class ApprovalRequestTaskDetailsResponse : ApprovalRequestTaskResponse
{
    public ApprovalRequestTaskDetailsResponse()
    {
    }

    [SetsRequiredMembers]
    public ApprovalRequestTaskDetailsResponse(ApprovalRequestTaskResponse source) : base(source)
    {
        RequestFiles = [];
    }

    /// <summary>Files attached to the approval request.</summary>
    public required List<ApprovalRequestFileResponse> RequestFiles { get; init; }
    /// <summary>Approval request associated with this task.</summary>
    public ApprovalRequestDetailsResponse? ApprovalRequest { get; init; }
}
