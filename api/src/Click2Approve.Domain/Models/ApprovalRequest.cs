namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request.
/// </summary>
public class ApprovalRequest : DbEntity
{
    // Foreign key identifiers
    public long? CompletedByEmployeeId { get; set; }
    public string? CompletedByUserId { get; set; }
    public long? CreatedByEmployeeId { get; set; }
    public required string CreatedByUserId { get; set; }
    public long? PreviousRevisionApprovalRequestId { get; set; }
    public long TenantId { get; set; }

    // Scalar properties
    public DateTime? CompletedAt { get; set; }
    public string? CompletedByDisplayName { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required string CreatedByDisplayName { get; set; }
    public required string OrganizationDisplayName { get; set; }
    public required string? Description { get; set; }
    public int RevisionNumber { get; set; } = 1;
    public bool? Result { get; set; }
    public required ApprovalRequestStatus Status { get; set; }
    public required string Title { get; set; }

    // Navigation properties
    public AppUser? CompletedByUser { get; set; }
    public AppUser CreatedByUser { get; set; } = null!;
    public ApprovalRequest? NextRevisionApprovalRequest { get; set; }
    public ApprovalRequest? PreviousRevisionApprovalRequest { get; set; }
    public List<ApprovalRequestFile> RequestFiles { get; set; } = [];
    public List<ApprovalRequestStep> Steps { get; set; } = [];
    public Tenant Tenant { get; set; } = null!;
}
