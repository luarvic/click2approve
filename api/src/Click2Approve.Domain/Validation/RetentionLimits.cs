namespace Click2Approve.Domain.Validation;

/// <summary>Defines persisted retention policy bounds; zero disables automatic deletion.</summary>
public static class RetentionLimits
{
    public const int NeverDeleteMonths = 0;
    public const int MaximumMonths = 1200;
}
