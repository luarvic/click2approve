namespace click2approve.WebAPI.Extensions;

/// <summary>
/// Extends IFormFile interface.
/// </summary>
public static class FormFileExtensions
{
    /// <summary>
    /// Converts IFormFile object to bytes.
    /// </summary>
    public static async Task<byte[]> ToBytesAsync(this IFormFile formFile, CancellationToken cancellationToken)
    {
        using var stream = new MemoryStream();
        await formFile.CopyToAsync(stream, cancellationToken);
        return stream.ToArray();
    }
}
