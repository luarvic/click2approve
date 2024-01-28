
using System.Net.Http.Headers;
using Newtonsoft.Json;

namespace api.Services;

// A service that generates thumbnails of files.
// The implementation uses https://github.com/jodconverter/docker-image-jodconverter-examples file converter with REST interface.
public class ThumbnailService(IConfiguration configuration, HttpClient httpClient, ILogger<ThumbnailService> logger) : IThumbnailService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<ThumbnailService> _logger = logger;

    public async Task<HttpResponseMessage> CreateThumbnailAsync(string filename, byte[] data, CancellationToken cancellationToken)
    {
        var convertToPngUri = new Uri(GetThumbnailUri(), "lool/convert-to/png");
        using var streamContent = new StreamContent(new MemoryStream(data));
        using var content = new MultipartFormDataContent
        {
            { streamContent, "data", filename }
        };
        var response = await _httpClient.PostAsync(convertToPngUri, content, cancellationToken);
        return response;
    }

    private Uri GetThumbnailUri()
    {
        var baseUri = _configuration["Thumbnail:BaseUri"];
        if (string.IsNullOrWhiteSpace(baseUri))
        {
            throw new Exception("Base URI of thumbnail service is not defined.");
        }

        return new Uri(baseUri);
    }
}
