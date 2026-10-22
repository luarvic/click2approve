using System.Text.Json;
using System.Text.Json.Serialization;

namespace Click2Approve.Domain.Models;

/// <summary>
/// Provides common identifiers for persisted entities.
/// </summary>
public abstract class DbEntity
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        ReferenceHandler = ReferenceHandler.IgnoreCycles
    };

    // Entity identifiers
    public Guid GlobalId { get; init; } = Guid.NewGuid();

    [JsonIgnore]
    public long Id { get; set; }

    public override string ToString()
    {
        return JsonSerializer.Serialize(this, JsonOptions);
    }
}
