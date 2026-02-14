using System.Text.Json;
using System.Text.Json.Serialization;

namespace Click2Approve.WebApi.Models;

/// <summary>
/// Represents an approval request task.
/// </summary>
public class ApprovalRequestTask
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        ReferenceHandler = ReferenceHandler.IgnoreCycles
    };

    public long Id { get; set; }
    public required ApprovalRequest ApprovalRequest { get; set; }
    public required string Approver { get; set; }
    public ApprovalStatus Status { get; set; }
    public DateTime? Completed { get; set; }
    public string? Comment { get; set; }
    public override string ToString()
    {
        return JsonSerializer.Serialize(this, JsonOptions);
    }
}
