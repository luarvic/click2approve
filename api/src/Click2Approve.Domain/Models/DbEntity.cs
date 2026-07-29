using System.Text.Json;
using System.Text.Json.Serialization;

namespace Click2Approve.Domain.Models;

public abstract class DbEntity
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        ReferenceHandler = ReferenceHandler.IgnoreCycles
    };

    [JsonIgnore]
    public long Id { get; set; }

    public Guid GlobalId { get; init; } = Guid.NewGuid();

    public override string ToString()
    {
        return JsonSerializer.Serialize(this, JsonOptions);
    }
}
