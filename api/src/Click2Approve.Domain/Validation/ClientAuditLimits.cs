namespace Click2Approve.Domain.Validation;

/// <summary>Defines accepted client audit metadata sizes and timezone offsets.</summary>
public static class ClientAuditLimits
{
    public const int ShortValue = 64;
    public const int LanguageCount = 32;
    public const int MinimumTimeZoneOffsetMinutes = -840;
    public const int MaximumTimeZoneOffsetMinutes = 840;
}
