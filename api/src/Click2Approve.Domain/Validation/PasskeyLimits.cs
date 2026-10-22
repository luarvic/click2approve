namespace Click2Approve.Domain.Validation;

/// <summary>Defines WebAuthn input limits.</summary>
public static class PasskeyLimits
{
    public const int Name = 100;
    public const int EncodedCredentialId = 400;
    public const int CredentialIdBytes = 300;
}
