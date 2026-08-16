using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Tests.Services;

/// <summary>
/// Mocks a service that manages public and private binary files.
/// </summary>
public class MockFileStorage : IUserFileStorage
{
    private readonly Dictionary<string, byte[]> _files = [];

    public Task SaveAsync(UserFile userFile, byte[] bytes, CancellationToken cancellationToken)
    {
        try
        {
            _files.Add(GetPath(userFile), bytes);
            return Task.CompletedTask;
        }
        catch (Exception e)
        {
            throw new Exception($"Unable to create file {userFile.Name}.", e);
        }
    }

    public Task DeleteAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        try
        {
            cancellationToken.ThrowIfCancellationRequested();
            _files.Remove(GetPath(userFile));
            return Task.CompletedTask;
        }
        catch (Exception e)
        {
            throw new Exception($"Unable to delete file {userFile.Name}.", e);
        }
    }

    public Task<byte[]> ReadAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        try
        {
            var file = _files.Single(f => f.Key == GetPath(userFile)).Value;
            return Task.FromResult(file);
        }
        catch (Exception e)
        {
            throw new Exception($"Unable to read file {userFile.Name}.", e);
        }
    }

    public string GetPublicUrl(UserFile userFile)
    {
        return $"https://storage.example.test/{GetPath(userFile)}";
    }

    private static string GetPath(UserFile userFile) => $"{userFile.StorageType}/{userFile.GlobalId}";
}
