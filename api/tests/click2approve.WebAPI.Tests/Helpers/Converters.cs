using System.Net.Http.Headers;

namespace click2approve.WebAPI.Tests.Helpers;

/// <summary>
/// Implements convertors required for testing.
/// </summary>
public static class Converters
{
    /// <summary>
    /// Generates a stream content out of bytes.
    /// </summary>
    public static StreamContent GetStreamContentFromBytes(byte[] bytes)
    {
        var memoryStream = new MemoryStream(bytes);
        var streamContent = new StreamContent(memoryStream);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
        return streamContent;
    }
}