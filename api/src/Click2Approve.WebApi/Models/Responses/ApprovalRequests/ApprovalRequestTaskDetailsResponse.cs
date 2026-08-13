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

    public required List<ApprovalRequestFileResponse> RequestFiles { get; init; }
    public ApprovalRequestDetailsResponse? ApprovalRequest { get; init; }
}
