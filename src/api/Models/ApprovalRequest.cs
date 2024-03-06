namespace api.Models;

// Represents an approval request.
public class ApprovalRequest
{
    public long Id { get; set; }
    public required List<UserFile> UserFiles { get; set; }
    public required List<Approver> Approvers { get; set; }
    public required DateTime ApproveBy { get; set; }
    public required string? Comment { get; set; }
    public required DateTime SendDate { get; set; }
}
