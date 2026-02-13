using System.Text.Json;
using System.Text.Json.Serialization;

namespace Click2Approve.WebAPI.Models;

/// <summary>
/// Represents a user file.
/// </summary>
public class UserFile
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        ReferenceHandler = ReferenceHandler.IgnoreCycles
    };

    public long Id { get; set; }
    public required string Name { get; set; }
    public required string Type { get; set; }
    public required DateTime Created { get; set; }
    public required AppUser Owner { get; set; }
    public required long Size { get; set; }
    public List<ApprovalRequest> ApprovalRequests { get; set; } = [];

    public override string ToString()
    {
        return JsonSerializer.Serialize(this, JsonOptions);
    }
}
