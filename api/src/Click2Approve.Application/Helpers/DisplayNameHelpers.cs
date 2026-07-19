using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Helpers;

/// <summary>
/// Provides shared user display-name formatting.
/// </summary>
public static class DisplayNameHelpers
{
    /// <summary>
    /// Formats a user display name as "FirstName LastName (email)".
    /// </summary>
    public static string FormatUser(AppUser user)
    {
        return FormatUser(user.FirstName, user.LastName, user.Email ?? user.NormalizedEmail ?? string.Empty);
    }

    /// <summary>
    /// Formats a user display name as "FirstName LastName (email)".
    /// </summary>
    public static string FormatUser(string? firstName, string? lastName, string email)
    {
        var normalizedEmail = NormalizeEmailForDisplay(email);
        var name = JoinNonEmpty(firstName, lastName);
        return string.IsNullOrWhiteSpace(name)
            ? normalizedEmail
            : $"{name} ({normalizedEmail})";
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
