using System.Diagnostics.CodeAnalysis;

namespace Click2Approve.Application.Models.Results.ApprovalRequests;

/// <summary>
/// Represents the full task data required by an approval task editor.
/// </summary>
public class ApprovalRequestTaskDetailsResult : ApprovalRequestTaskResult
{
    public ApprovalRequestTaskDetailsResult()
    {
    }

    [SetsRequiredMembers]
    public ApprovalRequestTaskDetailsResult(ApprovalRequestTaskResult source) : base(source)
    {
        RequestFiles = [];
    }

    public required List<ApprovalRequestFileResult> RequestFiles { get; init; }
    public ApprovalRequestDetailsResult? ApprovalRequest { get; init; }
}
