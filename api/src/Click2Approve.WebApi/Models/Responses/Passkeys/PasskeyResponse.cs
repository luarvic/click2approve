namespace Click2Approve.WebApi.Models.Responses.Passkeys;

/// <summary>
/// Represents a passkey registered by the authenticated user.
/// </summary>
public class PasskeyResponse
{
    public string? CreatedAt { get; init; }

    public required string CredentialId { get; init; }

    public string? LastUsedAt { get; init; }

    public required string Name { get; init; }

    public required string Type { get; init; }
}
