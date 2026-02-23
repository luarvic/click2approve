namespace Click2Approve.WebApi.Models;

/// <summary>
/// Represents an approval request task.
/// </summary>
public class ApprovalRequestTask : DbEntity
{
    public required ApprovalRequest ApprovalRequest { get; set; }
    public required string Approver { get; set; }
    public ApprovalStatus Status { get; set; }
    public DateTime? Completed { get; set; }
    public string? Comment { get; set; }
}
