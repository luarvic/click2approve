namespace Click2Approve.Domain.Validation;

/// <summary>Defines persisted text limits shared by persistence, API and application validation.</summary>
public static class FieldLimits
{
    public const int Name = 255;
    public const int Email = 256;
    public const int Phone = 64;
    public const int Url = 2048;
    public const int Details = 1024;
    public const int Text = 4000;
    // Participant snapshots combine first name, last name and position with separators.
    public const int ParticipantDisplayName = 768;
    public const int IpAddress = 128;
    public const int AuditEntityState = 32;
    public const int EventType = 128;
    public const int NotificationSummary = 512;
    public const int Signature = 16000;

    public const int IdentityUserName = 256;
    public const int IdentityRoleName = 256;
    public const int IdentityStamp = 255;
    public const int IdentityPasswordHash = 1024;
    // With the long user ID, these Unicode key components fit SQL Server's 900-byte key limit.
    public const int IdentityLoginProvider = 32;
    public const int IdentityProviderKey = 400;
    public const int IdentityTokenName = 400;
    public const int IdentityTokenValue = 16000;
    public const int IdentityClaimType = 255;
    public const int IdentityClaimValue = 4000;

    public const int EventPayload = 65536;
    // Audit records contain old and new values, with JSON escaping, including signatures.
    public const int AuditChanges = 262144;
}
