namespace Click2Approve.WebApi.Models.Responses.Identity;

/// <summary>Describes authenticator enrollment and deployment availability.</summary>
public sealed record MfaStatusResponse(bool Enabled, bool IsAvailable);
