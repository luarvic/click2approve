namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Identifies a domain object supported by the deletion worker.
/// </summary>
public enum DeletionTargetType
{
    ApprovalRequest,
    AuditLog,
    // Reserved for commands queued by older publishers. New outbox cleanup runs directly in SQL.
    EventOutboxMessage,
    InAppNotification,
    Tenant,
    UserFile,
    Receipt,
    SupportConversation
}
