using System.Text.Json;

namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Provides the shared JSON configuration for versioned event envelopes and payloads.
/// </summary>
public static class EventJson
{
    /// <summary>
    /// Gets the immutable JSON options used to serialize and deserialize event transport data.
    /// </summary>
    public static JsonSerializerOptions Options { get; } = new(JsonSerializerDefaults.Web);
}
