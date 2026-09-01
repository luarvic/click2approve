namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Identifies a domain object supported by the deletion worker.
/// </summary>
public enum DeletionTargetType
{
    Tenant,
    UserFile
}
