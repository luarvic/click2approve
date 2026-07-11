namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request.
/// </summary>
public class ApprovalRequest : DbEntity
{
    public required string Title { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required string AuthorUserId { get; set; }
    public AppUser AuthorUser { get; set; } = null!;
    public required string AuthorEmail { get; set; }
    public long TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public required ApprovalRequestStatus Status { get; set; }
    public required List<UserFile> UserFiles { get; set; }
    public required List<ApprovalRequestStep> Steps { get; set; }
    public DateTime? CompletedAt { get; set; }
    public required string? Description { get; set; }
    public required List<ApprovalRequestTask> Tasks { get; set; }
}
