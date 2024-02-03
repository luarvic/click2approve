using System.Net.Http.Headers;
using api.Extensions;

namespace api.Services;

// Implements storing binary data logic.
// Uses on https://github.com/rumkin/file-storage file storage with REST interface.
public class StoreService(IConfiguration configuration, HttpClient httpClient, ILogger<StoreService> logger) : IStoreService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<StoreService> _logger = logger;

    public async Task AddFileAsync(string id, string filename, byte[] bytes, CancellationToken cancellationToken)
    {
        var fileUri = new Uri(GetStorageUri(), $"files/{id}");
        var content = new ByteArrayContent(bytes);
        content.Headers.ContentType = new MediaTypeHeaderValue(MimeTypes.GetMimeType(filename));
        content.Headers.ContentLength = bytes.Length;
        content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") { FileName = filename };
        await _httpClient.PostAsync(fileUri, content, cancellationToken);
    }

    public async Task<byte[]> GetFileAsync(string id, CancellationToken cancellationToken)
    {
        var fileUri = new Uri(GetStorageUri(), $"files/{id}");
        var response = await _httpClient.GetAsync(fileUri, cancellationToken);
        using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await stream.ToBytesAsync(cancellationToken);
    }

    private Uri GetStorageUri()
    {
        var baseUri = _configuration["FileStore:BaseUri"];
        if (string.IsNullOrWhiteSpace(baseUri))
        {
            throw new Exception("Base URI of file storage service is not defined.");
        }
        return new Uri(baseUri);
    }
}
