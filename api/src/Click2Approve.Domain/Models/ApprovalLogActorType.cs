namespace Click2Approve.Domain.Models;

/// <summary>
/// Identifies the kind of actor that produced an approval log event.
/// </summary>
public enum ApprovalLogActorType
{
    System,
    User,
    Employee
}
