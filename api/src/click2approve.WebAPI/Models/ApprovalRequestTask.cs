using Newtonsoft.Json;

namespace click2approve.WebAPI.Models;

public class ApprovalRequestTask
{
    public long Id { get; set; }
    public required ApprovalRequest ApprovalRequest { get; set; }
    public required string Approver { get; set; }
    public ApprovalStatus Status { get; set; }
    public DateTime? Completed { get; set; }
    public string? Comment { get; set; }
    public override string ToString()
    {
        return JsonConvert.SerializeObject(this, new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
    }
}
