using Click2Approve.WebApi.Identity;

namespace Click2Approve.WebApi.Tests.Identity;

/// <summary>
/// Tests lower-invariant lookup normalization.
/// </summary>
public class LowerInvariantLookupNormalizerTests
{
    [Fact]
    public void NormalizeEmail_ShouldReturnLowerInvariant()
    {
        var normalizer = new LowerInvariantLookupNormalizer();

        var normalizedEmail = normalizer.NormalizeEmail("Person@Example.COM");

        Assert.Equal("person@example.com", normalizedEmail);
    }

    [Fact]
    public void NormalizeName_ShouldReturnLowerInvariant()
    {
        var normalizer = new LowerInvariantLookupNormalizer();

        var normalizedName = normalizer.NormalizeName("Person@Example.COM");

        Assert.Equal("person@example.com", normalizedName);
    }
}
