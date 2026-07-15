using Microsoft.AspNetCore.Identity;

namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a user in Identity framework.
/// </summary>
public class AppUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Avatar { get; set; }
    public long? DefaultTenantId { get; set; }
    public bool HasLoggedIn { get; set; }
    public List<UserNotificationPreference> NotificationPreferences { get; set; } = [];
}
