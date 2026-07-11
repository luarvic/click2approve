namespace Click2Approve.WebApi.Models.DTOs;

/// <summary>
/// Identifies the tenant that scopes the authenticated user's personal workflow.
/// </summary>
public class CurrentTenantDto
{
    public long Id { get; init; }
}
