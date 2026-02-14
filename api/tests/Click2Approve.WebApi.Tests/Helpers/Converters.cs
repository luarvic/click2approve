using System.Net.Http.Headers;

namespace Click2Approve.WebApi.Tests.Helpers;

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

    /// <summary>
    /// Generates a query string out of dictionary.
    /// </summary>
    public static string GetQueryStringFromDictionary(Dictionary<string, string>? dictionary)
    {
        return dictionary != null ?
            string.Join("&",
                dictionary.Select(kvp =>
                    string.Format("{0}={1}", kvp.Key, kvp.Value))) :
            "";
    }

    /// <summary>
    /// Encodes a string to Base64.
    /// </summary>
    public static string GetBase64FromString(string plainText)
    {
        var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
        return Convert.ToBase64String(plainTextBytes);
    }
}
