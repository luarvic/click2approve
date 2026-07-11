using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approval task returned with an approval request.
/// </summary>
public class ApprovalRequestTaskDto
{
    public long Id { get; init; }
    public required string Title { get; init; }
    public long ApprovalRequestId { get; init; }
    public long ApprovalRequestStepId { get; init; }
    public long? ApprovalRequestStepApproverId { get; init; }
    public string? ApproverUserId { get; init; }
    public required string ApproverEmail { get; init; }
    public string? ApproverDisplayName { get; init; }
    public bool CanViewRequest { get; init; }
    public ApprovalRequestTaskStatus Status { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public string? Description { get; init; }
    public string? Comment { get; init; }
}
