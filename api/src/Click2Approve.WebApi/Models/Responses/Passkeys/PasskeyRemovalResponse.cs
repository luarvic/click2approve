namespace Click2Approve.WebApi.Models.Responses.Passkeys;

/// <summary>
/// Provides the relying party identifier for notifying passkey providers after removal.
/// </summary>
public class PasskeyRemovalResponse
{
    /// <summary>Configured relying party domain that owns the removed credential.</summary>
    public required string RpId { get; init; }
}
