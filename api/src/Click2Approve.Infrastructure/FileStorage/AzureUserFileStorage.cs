using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Infrastructure.FileStorage;

/// <summary>
/// Stores public and private user-file content in Azure Blob Storage.
/// </summary>
public class AzureUserFileStorage(IConfiguration configuration) : IUserFileStorage
{
    private readonly Lazy<Task<BlobContainerClient>> _private = new(() => CreateAsync(configuration, "PrivateContainerName", PublicAccessType.None));
    private readonly Lazy<Task<BlobContainerClient>> _public = new(() => CreateAsync(configuration, "PublicContainerName", PublicAccessType.Blob));

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

        return _public.Value.GetAwaiter().GetResult().GetBlobClient(GetPath(userFile)).Uri.AbsoluteUri;
    }

    private static async Task DeleteAsync(
        Lazy<Task<BlobContainerClient>> container,
        UserFile userFile,
        CancellationToken cancellationToken)
    {
        var initializedContainer = await container.Value.WaitAsync(cancellationToken);
        await initializedContainer.DeleteBlobIfExistsAsync(GetPath(userFile), cancellationToken: cancellationToken);
    }

    private static async Task<BlobContainerClient> CreateAsync(
        IConfiguration configuration,
        string key,
        PublicAccessType publicAccessType)
    {
        var connectionString = configuration["FileStorage:ConnectionString"]
            ?? throw new InfrastructureException("FileStorage configuration is invalid.");
        var containerName = configuration[$"FileStorage:{key}"]
            ?? throw new InfrastructureException("FileStorage configuration is invalid.");
        var container = new BlobContainerClient(connectionString, containerName);
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
