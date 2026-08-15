using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Results.ApprovalRequests;

/// <summary>
/// Contains a task and its hidden step sequences for an assignee's page view.
/// </summary>
public class ApprovalRequestTaskWithHiddenStepSequencesResult
{
    public required List<int> HiddenStepSequences { get; init; }

    public required ApprovalRequestTask Task { get; init; }
}
