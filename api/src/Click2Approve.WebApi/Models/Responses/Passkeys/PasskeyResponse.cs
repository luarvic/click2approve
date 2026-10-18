namespace Click2Approve.WebApi.Models.Responses.Passkeys;

/// <summary>
/// Represents a passkey registered by the authenticated user.
/// </summary>
public class PasskeyResponse
{
    /// <summary>Time when the passkey was created.</summary>
    public string? CreatedAt { get; init; }

    /// <summary>Identifier of the registered passkey credential.</summary>
    public required string CredentialId { get; init; }

    /// <summary>Time when the passkey was last used.</summary>
    public string? LastUsedAt { get; init; }

    /// <summary>Name of the passkey.</summary>
    public required string Name { get; init; }

    /// <summary>Type of the passkey.</summary>
    public required string Type { get; init; }
}
