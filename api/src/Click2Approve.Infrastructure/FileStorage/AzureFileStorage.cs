using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Domain.Exceptions;

namespace Click2Approve.Infrastructure.FileStorage;

/// <summary>
/// Stores binary files in an Azure Blob Storage container.
/// </summary>
public class AzureFileStorage : IPrivateFileStorage, IPublicFileStorage
{
    private readonly BlobContainerClient _containerClient;
    private readonly PublicAccessType _publicAccessType;

    /// <summary>
    /// Initializes a new instance of the <see cref="AzureFileStorage"/> class.
    /// </summary>
    public AzureFileStorage(IConfiguration configuration, string configurationSection, PublicAccessType publicAccessType = PublicAccessType.None)
    {
        var connectionString = configuration[$"{configurationSection}:ConnectionString"];
        var containerName = configuration[$"{configurationSection}:ContainerName"];
        if (string.IsNullOrWhiteSpace(connectionString) || string.IsNullOrWhiteSpace(containerName))
        {
            throw new InfrastructureException($"{configurationSection} configuration is invalid.");
        }

        _containerClient = new BlobContainerClient(connectionString, containerName);
        _publicAccessType = publicAccessType;
    }

    /// <summary>
    /// Saves bytes to a blob.
    /// </summary>
    public async Task SaveAsync(string path, byte[] bytes, CancellationToken cancellationToken)
    {
        try
        {
            await EnsureContainerAsync(cancellationToken);
            await GetBlobClient(path).UploadAsync(BinaryData.FromBytes(bytes), overwrite: false, cancellationToken);
        }
        catch (Exception e)
        {
            throw new InfrastructureException($"Failed to create file at path: {path}.", e);
        }
    }

    /// <summary>
    /// Deletes a blob.
    /// </summary>
    public async Task DeleteAsync(string path, CancellationToken cancellationToken)
    {
        try
        {
            await GetBlobClient(path).DeleteIfExistsAsync(cancellationToken: cancellationToken);
        }
        catch (Exception e)
        {
            throw new InfrastructureException($"Failed to delete file at path: {path}.", e);
        }
    }

    /// <summary>
    /// Reads bytes from a private blob.
    /// </summary>
    public async Task<byte[]> ReadAsync(string path, CancellationToken cancellationToken)
    {
        try
        {
            var response = await GetBlobClient(path).DownloadContentAsync(cancellationToken);
            return response.Value.Content.ToArray();
        }
        catch (Exception e)
        {
            throw new InfrastructureException($"Failed to read file at path: {path}.", e);
        }
    }

    /// <summary>
    /// Gets the public URL for a blob.
    /// </summary>
    public string GetUrl(string path)
    {
        return GetBlobClient(path).Uri.AbsoluteUri;
    }

    private async Task EnsureContainerAsync(CancellationToken cancellationToken)
    {
        await _containerClient.CreateIfNotExistsAsync(_publicAccessType, cancellationToken: cancellationToken);
        if (_publicAccessType != PublicAccessType.None)
        {
            await _containerClient.SetAccessPolicyAsync(_publicAccessType, cancellationToken: cancellationToken);
        }
    }

    private BlobClient GetBlobClient(string path)
    {
        return _containerClient.GetBlobClient(path.Replace('\\', '/'));
    }
}
