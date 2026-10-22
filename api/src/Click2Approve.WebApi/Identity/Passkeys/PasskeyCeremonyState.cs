namespace Click2Approve.WebApi.Identity.Passkeys;

/// <summary>
/// Represents protected, short-lived state for a WebAuthn ceremony.
/// </summary>
public class PasskeyCeremonyState
{
    public required string OptionsJson { get; init; }

    public string? UserId { get; init; }
}
