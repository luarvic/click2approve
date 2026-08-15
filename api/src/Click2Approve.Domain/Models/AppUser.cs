using Microsoft.AspNetCore.Identity;

namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a user in Identity framework.
/// </summary>
public class AppUser : IdentityUser<long>
{
    // Entity identifiers
    public Guid GlobalId { get; set; } = Guid.NewGuid();

    // Foreign key identifiers
    public long? DefaultTenantId { get; set; }

    // Scalar properties
    public string? Avatar { get; set; }
    public string? DefaultSignatureJson { get; set; }
    public string? FirstName { get; set; }
    public bool HasLoggedIn { get; set; }
    public bool IsPlaceholder { get; set; }
    public string? LastName { get; set; }

    // Navigation properties
    public List<UserNotificationPreference> NotificationPreferences { get; set; } = [];
}
