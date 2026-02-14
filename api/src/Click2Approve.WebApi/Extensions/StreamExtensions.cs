namespace Click2Approve.WebApi.Extensions;

/// <summary>
/// Extends methods for Stream class.
/// </summary>
public static class StreamExtensions
{
    /// <summary>
    /// Converts stream to bytes.
    /// </summary>
    public static async Task<byte[]> ToBytesAsync(this Stream stream, CancellationToken cancellationToken)
    {
        using var memoryStream = new MemoryStream();
        await stream.CopyToAsync(memoryStream, cancellationToken);
        return memoryStream.ToArray();
    }
}
