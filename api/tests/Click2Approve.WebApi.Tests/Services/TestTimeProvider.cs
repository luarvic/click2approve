namespace Click2Approve.WebApi.Tests.Services;

/// <summary>Advances test time deterministically without delaying tests.</summary>
public sealed class TestTimeProvider : TimeProvider
{
    private DateTimeOffset _now = DateTimeOffset.UtcNow;
    public override DateTimeOffset GetUtcNow() => _now;
    public void Advance(TimeSpan duration) => _now += duration;
}
