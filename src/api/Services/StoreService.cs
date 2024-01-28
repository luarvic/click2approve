using System.Net.Http.Headers;

namespace api.Services;

// A service that stores a binary data.
// The implementation uses on https://github.com/rumkin/file-storage file storage with REST interface.
public class StoreService(IConfiguration configuration, HttpClient httpClient, ILogger<StoreService> logger) : IStoreService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<StoreService> _logger = logger;

    public async Task AddFileAsync(string id, string filename, byte[] data, CancellationToken cancellationToken)
    {
        var fileUri = new Uri(GetStorageUri(), $"files/{id}");
        var content = new ByteArrayContent(data);
        content.Headers.ContentType = new MediaTypeHeaderValue(MimeTypes.GetMimeType(filename));
        content.Headers.ContentLength = data.Length;
        content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") { FileName = filename };
        await _httpClient.PostAsync(fileUri, content, cancellationToken);
    }

    public async Task<HttpResponseMessage> GetFileAsync(string id, CancellationToken cancellationToken)
    {
        var fileUri = new Uri(GetStorageUri(), $"files/{id}?download");
        var response = await _httpClient.GetAsync(fileUri, cancellationToken);
        return response;
    }

    private Uri GetStorageUri()
    {
        var baseUri = _configuration["FileStorage:BaseUri"];
        if (string.IsNullOrWhiteSpace(baseUri))
        {
            throw new Exception("Base URI of file storage service is not defined.");
        }

        return new Uri(baseUri);
    }
}
