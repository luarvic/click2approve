namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Defines stable versioned application event type identifiers.
/// </summary>
public static class EventTypes
{
    /// <summary>
    /// Identifies a notification request for one recipient.
    /// </summary>
    public const string NotificationRequestedV1 = "notification.requested.v1";

    /// <summary>
    /// Identifies a rendered account or security email that must be sent.
    /// </summary>
    public const string AccountEmailRequestedV1 = "account-email.requested.v1";
}
