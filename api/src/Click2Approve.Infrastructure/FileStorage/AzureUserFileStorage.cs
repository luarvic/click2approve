using Azure.Core;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Application.Helpers;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Infrastructure.FileStorage;

/// <summary>
/// Stores public and private user-file content in Azure Blob Storage.
/// </summary>
public class AzureUserFileStorage : IUserFileStorage
{
    private readonly IConfiguration _configuration;
    private readonly Lazy<BlobContainerClient> _publicClient;
    private readonly Lazy<Task<BlobContainerClient>> _private;
    private readonly Lazy<Task<BlobContainerClient>> _public;

    public AzureUserFileStorage(IConfiguration configuration, TokenCredential credential)
    {
        _configuration = configuration;
        _publicClient = new(() => CreateClient(configuration, credential, "PublicContainerName"));
        _public = new(() => EnsureContainerAsync(_publicClient.Value, PublicAccessType.Blob));
        _private = new(() => EnsureContainerAsync(
            CreateClient(configuration, credential, "PrivateContainerName"), PublicAccessType.None));
    }

    public async Task SaveAsync(UserFile userFile, byte[] bytes, CancellationToken cancellationToken)
    {
        var container = await GetContainer(userFile.StorageType).Value.WaitAsync(cancellationToken);
        await container.GetBlobClient(GetPath(userFile)).UploadAsync(
            BinaryData.FromBytes(bytes),
            overwrite: false,
            cancellationToken);
    }

    public async Task<byte[]> ReadAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        if (userFile.StorageType == UserFileStorageType.Public)
        {
            throw new InvalidOperationException("Public files cannot be read through private storage.");
        }

        var container = await _private.Value.WaitAsync(cancellationToken);
        var response = await container.GetBlobClient(GetPath(userFile)).DownloadContentAsync(cancellationToken);
        return response.Value.Content.ToArray();
    }

    public Task DeleteAsync(UserFile userFile, CancellationToken cancellationToken) =>
        DeleteAsync(GetContainer(userFile.StorageType), userFile, cancellationToken);

    public string GetPublicUrl(UserFile userFile)
    {
        if (userFile.StorageType != UserFileStorageType.Public)
        {
            throw new InvalidOperationException("Private files do not have public URLs.");
        }

        var container = _publicClient.Value;
        var fileName = GetPath(userFile);
        var publicServiceUri = _configuration["FileStorage:PublicServiceUri"];
        return string.IsNullOrWhiteSpace(publicServiceUri)
            ? container.GetBlobClient(fileName).Uri.AbsoluteUri
            : UriHelpers.GetPublicFileUri(new Uri(publicServiceUri), container.Name, fileName).AbsoluteUri;
    }

    private static async Task DeleteAsync(
        Lazy<Task<BlobContainerClient>> container,
        UserFile userFile,
        CancellationToken cancellationToken)
    {
        var initializedContainer = await container.Value.WaitAsync(cancellationToken);
        await initializedContainer.DeleteBlobIfExistsAsync(GetPath(userFile), cancellationToken: cancellationToken);
    }

    private static BlobContainerClient CreateClient(
        IConfiguration configuration,
        TokenCredential credential,
        string key)
    {
        var containerName = configuration[$"FileStorage:{key}"]
            ?? throw new InfrastructureException("FileStorage configuration is invalid.");
        var connectionString = configuration["FileStorage:ConnectionString"];
        return !string.IsNullOrWhiteSpace(connectionString)
            ? new BlobContainerClient(connectionString, containerName)
            : new BlobServiceClient(
                new Uri(configuration["FileStorage:ServiceUri"]
                    ?? throw new InfrastructureException("FileStorage configuration is invalid.")),
                credential)
                .GetBlobContainerClient(containerName);
    }

    private static async Task<BlobContainerClient> EnsureContainerAsync(BlobContainerClient container, PublicAccessType publicAccessType)
    {
        await container.CreateIfNotExistsAsync(publicAccessType);
        return container;
    }

    private Lazy<Task<BlobContainerClient>> GetContainer(UserFileStorageType storageType) => storageType switch
    {
        UserFileStorageType.Private => _private,
        UserFileStorageType.Public => _public,
        _ => throw new ArgumentOutOfRangeException(nameof(storageType), storageType, "Unsupported user-file storage type.")
    };

    private static string GetPath(UserFile userFile) => $"{userFile.GlobalId}{Path.GetExtension(userFile.Name)}";
}
