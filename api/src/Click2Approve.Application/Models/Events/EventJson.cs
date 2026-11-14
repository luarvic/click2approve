using System.Text.Json;

namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Provides the shared JSON configuration for versioned event envelopes and payloads.
/// </summary>
public static class EventJson
{
    public static JsonSerializerOptions Options { get; } = new(JsonSerializerDefaults.Web);
}
