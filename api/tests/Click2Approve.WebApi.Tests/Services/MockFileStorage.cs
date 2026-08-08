using Click2Approve.Application.Abstractions.FileStorage;

namespace Click2Approve.WebApi.Tests.Services;

/// <summary>
/// Mocks a service that manages public and private binary files.
/// </summary>
public class MockFileStorage : IPrivateFileStorage, IPublicFileStorage
{
    private readonly Dictionary<string, byte[]> _files = [];

    public Task SaveAsync(string path, byte[] bytes, CancellationToken cancellationToken)
    {
        try
        {
            _files.Add(path, bytes);
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
            _files.Remove(path);
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
            var file = _files.Single(f => f.Key == path).Value;
            return Task.FromResult(file);
        }
        catch (Exception e)
        {
            throw new Exception($"Unable to read file {Path.GetFileName(path)}.", e);
        }
    }

    public string GetUrl(string path)
    {
        return $"https://storage.example.test/{path}";
    }
}
