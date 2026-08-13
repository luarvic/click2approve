namespace Click2Approve.WebApi.Models.Responses;

/// <summary>
/// Identifies the tenant that scopes the authenticated user's personal workflow.
/// </summary>
public class CurrentTenantResponse
{
    public Guid GlobalId { get; init; }
}
