namespace Click2Approve.WebApi.Models.DTOs;

public class ProductCapabilitiesDto
{
    public bool Tenants { get; set; }
    public bool EmployeeApprovers { get; set; }
    public bool TeamApprovers { get; set; }
    public bool ApprovalStepTemplates { get; set; }
    public bool ApprovalRequestSharing { get; set; }
}
