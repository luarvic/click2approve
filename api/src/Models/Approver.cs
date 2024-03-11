namespace api.Models;

// Represents an approver.
public class Approver
{
    public long Id { get; set; }
    public required string Email { get; set; }
    public List<ApprovalRequest> ApprovalRequests { get; set; } = [];
}
