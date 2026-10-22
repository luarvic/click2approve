namespace Click2Approve.WebApi.Models.Responses;

/// <summary>
/// Represents product capabilities returned by the API.
/// </summary>
public class ProductCapabilitiesResponse
{
    /// <summary>Whether organizations are available.</summary>
    public bool Tenants { get; set; }
    /// <summary>Whether personal access tokens are available.</summary>
    public bool ApiTokens { get; set; }
    /// <summary>Whether request discussions are available.</summary>
    public bool Discussions { get; set; }
    /// <summary>Whether discussion attachments are available.</summary>
    public bool DiscussionAttachments { get; set; }
    /// <summary>Whether employees can be assigned to approval steps.</summary>
    public bool EmployeeAssignees { get; set; }
    /// <summary>Whether teams can be assigned to approval steps.</summary>
    public bool TeamAssignees { get; set; }
    /// <summary>Whether approval step templates are available.</summary>
    public bool ApprovalStepTemplates { get; set; }
    /// <summary>Whether approval request revisions are available.</summary>
    public bool ApprovalRequestRevisions { get; set; }
    /// <summary>Whether approval receipts are available.</summary>
    public bool Receipts { get; set; }
    /// <summary>Whether subscription management is available.</summary>
    public bool Subscriptions { get; set; }
    /// <summary>Whether task attachments are available.</summary>
    public bool TaskAttachments { get; set; }
}
