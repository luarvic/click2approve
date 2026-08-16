namespace Click2Approve.Application.Helpers;

/// <summary>
/// Provides shared user display-name formatting.
/// </summary>
public static class DisplayNameHelpers
{
    /// <summary>
    /// Formats a participant display name from optional employee details.
    /// </summary>
    public static string FormatParticipantDisplayName(
        string? firstName,
        string? lastName,
        string? position,
        string? email)
    {
        var name = JoinNonEmpty(firstName, lastName);
        var title = position?.Trim();
        var identity = string.IsNullOrWhiteSpace(title)
            ? name
            : string.IsNullOrWhiteSpace(name)
                ? title
                : $"{name}, {title}";

        if (!string.IsNullOrWhiteSpace(identity)) return identity;

        var normalizedEmail = NormalizeEmailForDisplay(email);
        return normalizedEmail ?? throw new ArgumentException("Email must be provided if no name or title is available.", nameof(email));
    }

    /// <summary>
    /// Normalizes an email address for display labels.
    /// </summary>
    public static string NormalizeEmailForDisplay(string? email)
    {
        return email?.Trim().ToLowerInvariant() ?? string.Empty;
    }

    /// <summary>
    /// Joins non-empty text parts with a single space.
    /// </summary>
    public static string JoinNonEmpty(params string?[] values)
    {
        return string.Join(" ", values
            .Select(value => value?.Trim())
            .Where(value => !string.IsNullOrWhiteSpace(value)));
    }
}
