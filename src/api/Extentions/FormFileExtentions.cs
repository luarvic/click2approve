namespace api.Extentions;

// A set of extension methods for IFormFile interface.
public static class FormFileExtensions
{
    public static async Task<byte[]> ToBytesAsync(this IFormFile formFile, CancellationToken cancellationToken)
    {
        using var stream = new MemoryStream();
        await formFile.CopyToAsync(stream, cancellationToken);
        return stream.ToArray();
    }
}
