namespace Click2Approve.WebApi.Models;

/// <summary>
/// Represents a user file.
/// </summary>
public class UserFile : DbEntity
{
    public required string Name { get; set; }
    public required string Type { get; set; }
    public required DateTime Created { get; set; }
    public required AppUser Owner { get; set; }
    public required long Size { get; set; }
    public List<ApprovalRequest> ApprovalRequests { get; set; } = [];
}
