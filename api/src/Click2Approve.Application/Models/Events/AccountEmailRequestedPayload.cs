namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Represents an account email that the dispatcher must compose and send.
/// </summary>
public sealed record AccountEmailRequestedPayload(
    AccountEmailType Type,
    string ToAddress,
    string? ConfirmationLink = null,
    string? ResetLink = null,
    string? ResetCode = null,
    string? TenantName = null,
    bool IsNewUser = false);
