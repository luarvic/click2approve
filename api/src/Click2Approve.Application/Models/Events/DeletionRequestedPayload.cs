namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Requests permanent removal of one scheduled domain object.
/// </summary>
public sealed record DeletionRequestedPayload(DeletionTargetType TargetType, Guid TargetGlobalId);
