namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request.
/// </summary>
public class ApprovalRequest : DbEntity
{
    // Foreign key identifiers
    public long? CompletedByEmployeeId { get; set; }
    public long? CompletedByUserId { get; set; }
    public long? PreviousRevisionApprovalRequestId { get; set; }
    public long? RequesterEmployeeId { get; set; }
    public required long RequesterUserId { get; set; }
    public long? SubmittedByEmployeeId { get; set; }
    public required long SubmittedByUserId { get; set; }
    public long TenantId { get; set; }

    // Scalar properties
    public DateTime? CompletedAt { get; set; }
    public string? CompletedByDisplayName { get; set; }
    public required DateTime CreatedAt { get; set; }
    public DateTime? DeletionPublishedAt { get; set; }
    public required string? Description { get; set; }
    public required string OrganizationDisplayName { get; set; }
    public required string RequesterDisplayName { get; set; }
    public bool? Result { get; set; }
    public int RevisionNumber { get; set; } = 1;
    public DateTime? ScheduledForDeletionAt { get; set; }
    public required ApprovalRequestStatus Status { get; set; }
    public required string SubmittedByDisplayName { get; set; }
    public required string Title { get; set; }

    // Navigation properties
    public AppUser? CompletedByUser { get; set; }
    public ApprovalRequest? NextRevisionApprovalRequest { get; set; }
    public ApprovalRequest? PreviousRevisionApprovalRequest { get; set; }
    public List<ApprovalRequestFile> RequestFiles { get; set; } = [];
    public AppUser RequesterUser { get; set; } = null!;
    public List<ApprovalRequestStep> Steps { get; set; } = [];
    public AppUser SubmittedByUser { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
}
