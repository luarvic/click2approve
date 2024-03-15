namespace api.Models;

public class ApprovalRequestTask
{
    public long Id { get; set; }
    public required ApprovalRequest ApprovalRequest { get; set; }
    public required string Approver { get; set; }
    public ApprovalStatus Status { get; set; }
    public string? Comment { get; set; }
}
