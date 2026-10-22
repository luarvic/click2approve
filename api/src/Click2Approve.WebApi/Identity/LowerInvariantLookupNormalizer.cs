using Microsoft.AspNetCore.Identity;

namespace Click2Approve.WebApi.Identity;

/// <summary>
/// Normalizes identity lookup keys using lower invariant casing.
/// </summary>
public class LowerInvariantLookupNormalizer : ILookupNormalizer
{
    public string? NormalizeEmail(string? email)
    {
        return NormalizeName(email);
    }

    public string? NormalizeName(string? name)
    {
        return name?.Normalize().ToLowerInvariant();
    }
}
