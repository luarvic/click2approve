namespace api.Models;

public class ApprovalRequestLog
{
    public long Id { get; set; }
    public required ApprovalRequest ApprovalRequest { get; set; }
    public required DateTime When { get; set; }
    public required string Who { get; set; }
    public required ApprovalRequestStatus Status { get; set; }
    public string? Comment { get; set; }
}
