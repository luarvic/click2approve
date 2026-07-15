using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Helpers;

/// <summary>
/// Provides helper methods for deriving user profile names.
/// </summary>
public static class UserProfileNameHelpers
{
    /// <summary>
    /// Applies first and last name values from the user's email address when they are missing.
    /// </summary>
    public static void ApplyMissingNamesFromEmail(AppUser user)
    {
        if (!string.IsNullOrWhiteSpace(user.FirstName) && !string.IsNullOrWhiteSpace(user.LastName))
        {
            return;
        }

        var (firstName, lastName) = ResolveFromEmail(user.Email);
        user.FirstName = string.IsNullOrWhiteSpace(user.FirstName) ? firstName : user.FirstName;
        user.LastName = string.IsNullOrWhiteSpace(user.LastName) ? lastName : user.LastName;
    }

    /// <summary>
    /// Resolves first and last name values from an email address.
    /// </summary>
    public static (string? FirstName, string? LastName) ResolveFromEmail(string? email)
    {
        var localPart = email?.Split('@', 2)[0].Split('+', 2)[0];
        if (string.IsNullOrWhiteSpace(localPart))
        {
            return (null, null);
        }

        var parts = SplitNameParts(localPart);
        return parts.Count switch
        {
            0 => (null, null),
            1 => (parts[0], null),
            _ => (parts[0], parts[^1]),
        };
    }

    /// <summary>
    /// Normalizes an optional profile name value.
    /// </summary>
    public static string? NormalizeOptional(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private static List<string> SplitNameParts(string value)
    {
        var parts = new List<string>();
        foreach (var rawPart in value
            .Replace('.', ' ')
            .Replace('_', ' ')
            .Replace('-', ' ')
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .SelectMany(SplitCamelCase))
        {
            var part = NormalizeNamePart(rawPart);
            if (!string.IsNullOrWhiteSpace(part))
            {
                parts.Add(part);
            }
        }

        return parts;
    }

    private static IEnumerable<string> SplitCamelCase(string value)
    {
        var start = 0;
        for (var index = 1; index < value.Length; index++)
        {
            if (char.IsUpper(value[index]) && char.IsLower(value[index - 1]))
            {
                yield return value[start..index];
                start = index;
            }
        }

        yield return value[start..];
    }

    private static string? NormalizeNamePart(string value)
    {
        var letters = new string([.. value.Where(char.IsLetter)]);
        if (string.IsNullOrWhiteSpace(letters))
        {
            return null;
        }

        return string.Concat(
            char.ToUpperInvariant(letters[0]),
            letters[1..].ToLowerInvariant());
    }
}
