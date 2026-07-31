namespace Click2Approve.Domain.Models;

/// <summary>
/// Describes an approval request task status change.
/// </summary>
public sealed record ApprovalRequestTaskStatusChangedDetails(
    ApprovalRequestTaskStatus? PreviousStatus,
    ApprovalRequestTaskStatus Status,
    string? Comment,
    string? IpAddress,
    string? BrowserData,
    string? LegalFirstName,
    string? LegalLastName,
    DateOnly? DateOfBirth,
    bool? SignatureCaptured);
