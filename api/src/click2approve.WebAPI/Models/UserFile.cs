using Newtonsoft.Json;

namespace click2approve.WebAPI.Models;

// Represents a user's file.
public class UserFile
{
    public long Id { get; set; }
    public required string Name { get; set; }
    public required string Type { get; set; }
    public required DateTime Created { get; set; }
    public required string Owner { get; set; }
    public required long Size { get; set; }
    public List<ApprovalRequest> ApprovalRequests { get; set; } = [];

    public override string ToString()
    {
        return JsonConvert.SerializeObject(this, new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
    }
}
