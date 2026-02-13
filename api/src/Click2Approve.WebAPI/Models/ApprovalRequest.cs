using System.Text.Json;
using System.Text.Json.Serialization;

namespace Click2Approve.WebAPI.Models;

/// <summary>
/// Represents an approval request.
/// </summary>
public class ApprovalRequest
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        ReferenceHandler = ReferenceHandler.IgnoreCycles
    };

    public long Id { get; set; }
    public required DateTime Submitted { get; set; }
    public required string Author { get; set; }
    public required ApprovalStatus Status { get; set; }
    public required List<UserFile> UserFiles { get; set; }
    public required List<string> Approvers { get; set; }
    public DateTime? ApproveBy { get; set; }
    public required string? Comment { get; set; }
    public required List<ApprovalRequestTask> Tasks { get; set; }
    public override string ToString()
    {
        return JsonSerializer.Serialize(this, JsonOptions);
    }
}
