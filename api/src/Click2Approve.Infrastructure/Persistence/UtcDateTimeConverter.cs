using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Ensures persisted date and time values use UTC.
/// </summary>
public sealed class UtcDateTimeConverter : ValueConverter<DateTime, DateTime>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UtcDateTimeConverter"/> class.
    /// </summary>
    public UtcDateTimeConverter()
        : base(
            value => EnsureUtc(value),
            value => DateTime.SpecifyKind(value, DateTimeKind.Utc))
    {
    }

    private static DateTime EnsureUtc(DateTime value)
    {
        if (value.Kind != DateTimeKind.Utc)
        {
            throw new InvalidOperationException("Persisted DateTime values must use DateTimeKind.Utc.");
        }

        return value;
    }
}
