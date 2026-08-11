using Click2Approve.Application.Helpers;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Extensions;

/// <summary>
/// Extends methods for AppUser class.
/// </summary>
public static class AppUserExtensions
{
    /// <summary>
    /// Gets the normalized email address or an empty string when it is unavailable.
    /// </summary>
    public static string NormalizedEmailOrEmpty(this AppUser? user)
    {
        return user?.NormalizedEmail ?? string.Empty;
    }

    /// <summary>
    /// Formats a user-only participant display name.
    /// </summary>
    public static string FormatParticipantDisplayName(this AppUser? user) =>
        DisplayNameHelpers.FormatParticipantDisplayName(
            firstName: null,
            lastName: null,
            position: null,
            user.NormalizedEmailOrEmpty());

    /// <summary>
    /// Formats a user display name as "FirstName LastName (email)".
    /// </summary>
    public static string FormatUser(this AppUser user)
    {
        return DisplayNameHelpers.FormatUser(user.FirstName, user.LastName, user.NormalizedEmailOrEmpty());
    }
}
