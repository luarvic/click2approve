namespace api.Models;

// Represents an approval request.
public class ApprovalRequest
{
    public long Id { get; set; }
    public required List<UserFile> UserFiles { get; set; }
    public required List<string> Approvers { get; set; }
    public required DateTime ApproveBy { get; set; }
    public required string? Comment { get; set; }
    public required DateTime Submitted { get; set; }
    public required ApprovalStatus Status { get; set; }
    public required string Author { get; set; }
    public required List<ApprovalRequestLog> Logs { get; set; }
    public required List<ApprovalRequestTask> Tasks { get; set; }
}
