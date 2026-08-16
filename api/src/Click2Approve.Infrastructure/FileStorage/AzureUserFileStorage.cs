using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Infrastructure.FileStorage;

/// <summary>
/// Selects the backing storage and path for persisted user files.
/// </summary>
public class AzureUserFileStorage : IUserFileStorage
{
    private readonly BlobContainerClient _private;
    private readonly Lazy<Task> _privateInitialized;
    private readonly BlobContainerClient _public;
    private readonly Lazy<Task> _publicInitialized;
    private readonly BlobContainerClient _temporary;
    private readonly Lazy<Task> _temporaryInitialized;

    public AzureUserFileStorage(IConfiguration configuration)
    {
        _private = Create(configuration, "PrivateContainerName");
        _public = Create(configuration, "PublicContainerName");
        _temporary = Create(configuration, "TemporaryContainerName");
        _privateInitialized = new(() => EnsureContainerAsync(_private, PublicAccessType.None));
        _publicInitialized = new(() => EnsureContainerAsync(_public, PublicAccessType.Blob));
        _temporaryInitialized = new(() => EnsureContainerAsync(_temporary, PublicAccessType.None));
    }

    public Task SaveAsync(UserFile userFile, byte[] bytes, CancellationToken cancellationToken) =>
        userFile.StorageType switch
        {
            UserFileStorageType.Temporary => SaveAsync(_temporary, userFile, bytes, PublicAccessType.None, cancellationToken),
            UserFileStorageType.Private => SaveAsync(_private, userFile, bytes, PublicAccessType.None, cancellationToken),
            UserFileStorageType.Public => SaveAsync(_public, userFile, bytes, PublicAccessType.Blob, cancellationToken),
            _ => throw new ArgumentOutOfRangeException(nameof(userFile), userFile.StorageType, "Unsupported user-file storage type.")
        };

    public Task<byte[]> ReadAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        if (userFile.StorageType == UserFileStorageType.Public)
        {
            throw new InvalidOperationException("Public files cannot be read through private storage.");
        }

        return ReadAsync(GetContainer(userFile.StorageType), userFile, cancellationToken);
    }

    public async Task CopyToPrivateAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        if (userFile.StorageType != UserFileStorageType.Temporary)
        {
            throw new InvalidOperationException("Only temporary files can be copied to private storage.");
        }

        await _privateInitialized.Value.WaitAsync(cancellationToken);
        await _private.GetBlobClient(GetPath(userFile, UserFileStorageType.Private)).SyncCopyFromUriAsync(
            _temporary.GetBlobClient(GetPath(userFile)).Uri,
            cancellationToken: cancellationToken);
    }

    public async Task CopyToPublicAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        if (userFile.StorageType != UserFileStorageType.Temporary)
        {
            throw new InvalidOperationException("Only temporary files can be copied to public storage.");
        }

        await _publicInitialized.Value.WaitAsync(cancellationToken);
        await _public.GetBlobClient(GetPath(userFile, UserFileStorageType.Public)).SyncCopyFromUriAsync(
            _temporary.GetBlobClient(GetPath(userFile)).Uri,
            cancellationToken: cancellationToken);
    }

    public Task DeleteTemporaryAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        if (userFile.StorageType != UserFileStorageType.Temporary)
        {
            throw new InvalidOperationException("Only temporary files can be deleted from temporary storage.");
        }

        return _temporary.DeleteBlobIfExistsAsync(GetPath(userFile), cancellationToken: cancellationToken);
    }

    public Task DeleteAsync(UserFile userFile, CancellationToken cancellationToken) =>
        userFile.StorageType switch
        {
            UserFileStorageType.Temporary => _temporary.DeleteBlobIfExistsAsync(GetPath(userFile), cancellationToken: cancellationToken),
            UserFileStorageType.Private => _private.DeleteBlobIfExistsAsync(GetPath(userFile), cancellationToken: cancellationToken),
            UserFileStorageType.Public => _public.DeleteBlobIfExistsAsync(GetPath(userFile), cancellationToken: cancellationToken),
            _ => throw new ArgumentOutOfRangeException(nameof(userFile), userFile.StorageType, "Unsupported user-file storage type.")
        };

    public string GetPublicUrl(UserFile userFile)
    {
        if (userFile.StorageType != UserFileStorageType.Public)
        {
            throw new InvalidOperationException("Private files do not have public URLs.");
        }

        return _public.GetBlobClient(GetPath(userFile)).Uri.AbsoluteUri;
    }

    private async Task SaveAsync(
        BlobContainerClient container,
        UserFile userFile,
        byte[] bytes,
        PublicAccessType publicAccessType,
        CancellationToken cancellationToken)
    {
        await GetInitializationTask(container, publicAccessType).WaitAsync(cancellationToken);
        await container.GetBlobClient(GetPath(userFile)).UploadAsync(BinaryData.FromBytes(bytes), overwrite: false, cancellationToken);
    }

    private static async Task<byte[]> ReadAsync(BlobContainerClient container, UserFile userFile, CancellationToken cancellationToken)
    {
        var response = await container.GetBlobClient(GetPath(userFile)).DownloadContentAsync(cancellationToken);
        return response.Value.Content.ToArray();
    }

    private Task GetInitializationTask(BlobContainerClient container, PublicAccessType publicAccessType) =>
        container == _temporary
            ? _temporaryInitialized.Value
            : container == _private
                ? _privateInitialized.Value
                : _publicInitialized.Value;

    private static async Task EnsureContainerAsync(BlobContainerClient container, PublicAccessType publicAccessType)
    {
        await container.CreateIfNotExistsAsync(publicAccessType);
    }

    private BlobContainerClient GetContainer(UserFileStorageType type) => type == UserFileStorageType.Temporary ? _temporary : _private;

    private static BlobContainerClient Create(IConfiguration configuration, string key)
    {
        var connectionString = configuration["FileStorage:ConnectionString"]
            ?? throw new InfrastructureException("FileStorage configuration is invalid.");
        var containerName = configuration[$"FileStorage:{key}"]
            ?? throw new InfrastructureException("FileStorage configuration is invalid.");
        return new BlobContainerClient(connectionString, containerName);
    }

    private static string GetPath(UserFile userFile) => GetPath(userFile, userFile.StorageType);

    private static string GetPath(UserFile userFile, UserFileStorageType storageType) => Path.Combine(
        storageType.ToString().ToLowerInvariant(),
        $"{userFile.GlobalId}{Path.GetExtension(userFile.Name)}");
}
