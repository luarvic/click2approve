using Click2Approve.Application.Services.FileStorage;
using Microsoft.Extensions.Configuration;

namespace Click2Approve.WebApi.Tests.Services;

/// <summary>
/// Mocks a service that manages binary files.
/// </summary>
public class MockFileStorage(IConfiguration configuration) : IFileStorage
{
    private readonly Dictionary<string, byte[]> _files = [];
    private readonly string _rootPath = configuration["FileStorage:RootPath"] ?? throw new Exception("File storage root path is not defined.");

    public Task SaveAsync(string path, byte[] bytes, CancellationToken cancellationToken)
    {
        try
        {
            var fullPath = Path.Combine(_rootPath, path);
            _files.Add(fullPath, bytes);
            return Task.CompletedTask;
        }
        catch (Exception e)
        {
            throw new Exception($"Unable to create file {Path.GetFileName(path)}.", e);
        }
    }

    public Task DeleteAsync(string path, CancellationToken cancellationToken)
    {
        try
        {
            cancellationToken.ThrowIfCancellationRequested();
            var fullPath = Path.Combine(_rootPath, path);
            _files.Remove(fullPath);
            return Task.CompletedTask;
        }
        catch (Exception e)
        {
            throw new Exception($"Unable to delete file {Path.GetFileName(path)}.", e);
        }
    }

    public Task<byte[]> ReadAsync(string path, CancellationToken cancellationToken)
    {
        try
        {
            var fullPath = Path.Combine(_rootPath, path);
            var file = _files.Single(f => f.Key == fullPath).Value;
            return Task.FromResult(file);
        }
        catch (Exception e)
        {
            throw new Exception($"Unable to read file {Path.GetFileName(path)}.", e);
        }
    }
}
