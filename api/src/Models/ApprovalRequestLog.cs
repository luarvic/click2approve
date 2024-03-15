namespace api.Models;

public class ApprovalRequestLog
{
    public long Id { get; set; }
    public required ApprovalRequest ApprovalRequest { get; set; }
    public required string Who { get; set; }
    public required DateTime When { get; set; }
    public required string What { get; set; }
}
