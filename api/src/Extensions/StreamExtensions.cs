namespace api.Extensions;

// Extends methods for Stream class.
public static class StreamExtensions
{
    public static async Task<byte[]> ToBytesAsync(this Stream stream, CancellationToken cancellationToken)
    {
        using var memoryStream = new MemoryStream();
        await stream.CopyToAsync(memoryStream, cancellationToken);
        return memoryStream.ToArray();
    }
}
