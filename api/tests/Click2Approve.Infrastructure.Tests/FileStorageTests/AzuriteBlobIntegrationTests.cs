using Azure;
using Azure.Core;
using Azure.Storage.Blobs;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.FileStorage;
using Microsoft.Extensions.Configuration;

namespace Click2Approve.Infrastructure.Tests.FileStorageTests;

/// <summary>Runs the real Azure adapter against uniquely owned emulator containers.</summary>
public sealed class AzuriteBlobIntegrationTests
{
    [AzuriteFact]
    public async Task PrivateAndPublicFiles_PreserveBytesAccessRulesAndIdempotentDeletion()
    {
        var connection = Environment.GetEnvironmentVariable("C2A_TEST_AZURITE")!;
        var prefix = $"c2a-tests-{Guid.NewGuid():N}";
        var privateName = prefix + "-private";
        var publicName = prefix + "-public";
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["FileStorage:ConnectionString"] = connection,
            ["FileStorage:PrivateContainerName"] = privateName,
            ["FileStorage:PublicContainerName"] = publicName
        }).Build();
        var storage = new AzureUserFileStorage(configuration, new UnusedTokenCredential());
        var service = new BlobServiceClient(connection);
        var privateFile = new UserFile { Name = "document.txt", StorageType = UserFileStorageType.Private,
            OwnerId = 1, CreatedAt = DateTime.UtcNow, Size = 6, Type = "text/plain" };
        var publicFile = new UserFile { Name = "logo.svg", StorageType = UserFileStorageType.Public,
            OwnerId = 1, CreatedAt = DateTime.UtcNow, Size = 6, Type = "image/svg+xml" };
        byte[] bytes = [0, 1, 2, 127, 128, 255];
        try
        {
            await storage.SaveAsync(privateFile, bytes, default);
            Assert.Equal(bytes, await storage.ReadAsync(privateFile, default));
            Assert.Throws<InvalidOperationException>(() => storage.GetPublicUrl(privateFile));
            using var anonymous = new HttpClient();
            var privateUri = service.GetBlobContainerClient(privateName).GetBlobClient($"{privateFile.GlobalId}.txt").Uri;
            Assert.False((await anonymous.GetAsync(privateUri)).IsSuccessStatusCode);
            var duplicate = await Assert.ThrowsAsync<RequestFailedException>(() => storage.SaveAsync(privateFile, bytes, default));
            Assert.Equal(409, duplicate.Status);

            await storage.SaveAsync(publicFile, bytes, default);
            Assert.Equal(bytes, await anonymous.GetByteArrayAsync(storage.GetPublicUrl(publicFile)));
            await Assert.ThrowsAsync<InvalidOperationException>(() => storage.ReadAsync(publicFile, default));
            foreach (var file in new[] { privateFile, publicFile })
            {
                await storage.DeleteAsync(file, default);
                await storage.DeleteAsync(file, default);
            }
            var missing = await Assert.ThrowsAsync<RequestFailedException>(() => storage.ReadAsync(privateFile, default));
            Assert.Equal(404, missing.Status);
            Assert.False((await anonymous.GetAsync(storage.GetPublicUrl(publicFile))).IsSuccessStatusCode);
        }
        finally
        {
            await service.GetBlobContainerClient(privateName).DeleteIfExistsAsync();
            await service.GetBlobContainerClient(publicName).DeleteIfExistsAsync();
        }
    }
}

internal sealed class UnusedTokenCredential : TokenCredential
{
    public override AccessToken GetToken(TokenRequestContext requestContext, CancellationToken cancellationToken) =>
        throw new InvalidOperationException("Azurite uses the supplied connection string.");

    public override ValueTask<AccessToken> GetTokenAsync(TokenRequestContext requestContext, CancellationToken cancellationToken) =>
        throw new InvalidOperationException("Azurite uses the supplied connection string.");
}

public sealed class AzuriteFactAttribute : FactAttribute
{
    public AzuriteFactAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("C2A_TEST_AZURITE")))
            Skip = "Set C2A_TEST_AZURITE to an Azurite connection string.";
    }
}
