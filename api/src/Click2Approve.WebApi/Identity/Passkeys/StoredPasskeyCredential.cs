namespace Click2Approve.WebApi.Identity.Passkeys;

/// <summary>
/// Represents the public credential data retained for a registered passkey.
/// </summary>
public class StoredPasskeyCredential
{
    public string? AuthenticatorAttachment { get; init; }

    public required string CredentialId { get; init; }

    public DateTimeOffset? CreatedAt { get; init; }

    public DateTimeOffset? LastUsedAt { get; set; }

    public string? Name { get; init; }

    public required string PublicKey { get; init; }

    public uint SignCount { get; set; }
}
