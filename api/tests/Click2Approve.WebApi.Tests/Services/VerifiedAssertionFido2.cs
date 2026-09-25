using Fido2NetLib;
using Fido2NetLib.Objects;

namespace Click2Approve.WebApi.Tests.Services;

/// <summary>Isolates account-policy tests from authenticator hardware and cryptographic verification.</summary>
public sealed class VerifiedAssertionFido2 : IFido2
{
    public AssertionOptions GetAssertionOptions(GetAssertionOptionsParams parameters)
    {
        Assert.Equal(UserVerificationRequirement.Required, parameters.UserVerification);
        return new AssertionOptions
        {
            Challenge = [1, 2, 3],
            RpId = "localhost",
            UserVerification = parameters.UserVerification
        };
    }

    public Task<VerifyAssertionResult> MakeAssertionAsync(
        MakeAssertionParams parameters, CancellationToken cancellationToken = default) =>
        Task.FromResult(new VerifyAssertionResult { SignCount = parameters.StoredSignatureCounter + 1 });

    public Task<RegisteredPublicKeyCredential> MakeNewCredentialAsync(
        MakeNewCredentialParams parameters, CancellationToken cancellationToken = default) =>
        throw new NotSupportedException();

    public CredentialCreateOptions RequestNewCredential(RequestNewCredentialParams parameters) =>
        throw new NotSupportedException();
}
