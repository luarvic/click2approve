using Azure.Core;

namespace Click2Approve.EventWorkers.Tests.Integration;

/// <summary>Fails if a connection-string test unexpectedly attempts cloud authentication.</summary>
internal sealed class UnusedTokenCredential : TokenCredential
{
    public override AccessToken GetToken(TokenRequestContext requestContext, CancellationToken cancellationToken) =>
        throw new InvalidOperationException("Queue tests must use the configured connection string.");

    public override ValueTask<AccessToken> GetTokenAsync(TokenRequestContext requestContext, CancellationToken cancellationToken) =>
        throw new InvalidOperationException("Queue tests must use the configured connection string.");
}
