namespace Click2Approve.WebApi.Models.Responses;

/// <summary>
/// Represents product capabilities returned by the API.
/// </summary>
public class ProductCapabilitiesResponse
{
    public bool Tenants { get; set; }
    public bool ApiTokens { get; set; }
    public bool Discussions { get; set; }
    public bool DiscussionAttachments { get; set; }
    public bool EmployeeAssignees { get; set; }
    public bool TeamAssignees { get; set; }
    public bool ApprovalStepTemplates { get; set; }
    public bool ApprovalRequestRevisions { get; set; }
    public bool Receipts { get; set; }
    public bool Subscriptions { get; set; }
    public bool TaskAttachments { get; set; }
}
