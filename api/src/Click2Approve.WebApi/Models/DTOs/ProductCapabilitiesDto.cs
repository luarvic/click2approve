namespace Click2Approve.WebApi.Models.DTOs;

/// <summary>
/// Represents product capabilities returned by the API.
/// </summary>
public class ProductCapabilitiesDto
{
    public bool Tenants { get; set; }
    public bool EmployeeAssignees { get; set; }
    public bool TeamAssignees { get; set; }
    public bool ApprovalStepTemplates { get; set; }
    public bool ApprovalRequestRevisions { get; set; }
    public bool SharedVerificationLinks { get; set; }
}
