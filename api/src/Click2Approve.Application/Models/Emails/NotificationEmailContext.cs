using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Emails;

/// <summary>Contains rendering context for one notification, without changing its audience.</summary>
public sealed record NotificationEmailContext
{
    public required string RequestTitle { get; init; }
    public required string ActionUrl { get; init; }
    public EmailActor? Actor { get; init; }
    public ApprovalRequestTaskAction? Action { get; init; }
    public ApprovalRequestStatus? Status { get; init; }
    public bool? Result { get; init; }
    public string? StepName { get; init; }
    public string? Message { get; init; }
    public string? Reason { get; init; }
}
