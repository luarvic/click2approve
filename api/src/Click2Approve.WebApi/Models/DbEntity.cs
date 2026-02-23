using System.Text.Json;
using System.Text.Json.Serialization;

namespace Click2Approve.WebApi.Models;

public abstract class DbEntity
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        ReferenceHandler = ReferenceHandler.IgnoreCycles
    };

    public long Id { get; set; }

    public override string ToString()
    {
        return JsonSerializer.Serialize(this, JsonOptions);
    }
}
