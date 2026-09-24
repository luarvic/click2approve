using System.Text.Json;

namespace Click2Approve.Application.Validation;

/// <summary>Checks that signature data contains finite drawing coordinates.</summary>
public static class SignatureValidation
{
    public static bool IsValid(string? value)
    {
        if (string.IsNullOrEmpty(value)) return true;
        try
        {
            using var document = JsonDocument.Parse(value);
            if (document.RootElement.ValueKind != JsonValueKind.Array || document.RootElement.GetArrayLength() == 0)
                return false;
            return document.RootElement.EnumerateArray().All(group =>
                group.ValueKind == JsonValueKind.Object
                && group.TryGetProperty("points", out var points)
                && points.ValueKind == JsonValueKind.Array
                && points.GetArrayLength() > 0
                && points.EnumerateArray().All(point =>
                    point.ValueKind == JsonValueKind.Object && IsCoordinate(point, "x") && IsCoordinate(point, "y")));
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static bool IsCoordinate(JsonElement point, string property) =>
        point.TryGetProperty(property, out var coordinate)
        && coordinate.ValueKind == JsonValueKind.Number
        && coordinate.TryGetDouble(out var number) && double.IsFinite(number);
}
