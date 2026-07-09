using Click2Approve.Domain.Exceptions;

namespace Click2Approve.Application.Helpers;

/// <summary>
/// Represents a set of static methods for email handling.
/// </summary>
public static class EmailHelpers
{
    /// <summary>
    /// Normalizes an email address by trimming whitespace and converting it to lower invariant casing.
    /// </summary>
    public static string NormalizeEmailAddress(
        string? email,
        string requiredMessage = "Email is required.")
    {
        var normalizedEmail = email?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedEmail))
        {
            throw new BusinessRuleException(requiredMessage);
        }

        return normalizedEmail.ToLowerInvariant();
    }

    /// <summary>
    /// Normalizes an email address for identity-key comparisons.
    /// </summary>
    public static string NormalizeIdentityEmailKey(
        string? email,
        string requiredMessage = "Email is required.")
    {
        var normalizedEmail = email?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedEmail))
        {
            throw new BusinessRuleException(requiredMessage);
        }

        return normalizedEmail.ToUpperInvariant();
    }

    /// <summary>
    /// Builds an HTML email body with the given heading, message and link.
    /// </summary>
    public static string BuildHtmlEmail(string heading, string message, string link, string linkText)
    {
        return string.Join(
            Environment.NewLine,
            "<div style=\"font-family: Arial, sans-serif; font-size: 14px;\">",
            $"<p style=\"margin: 0 0 1em;\">{heading}</p>",
            $"<p style=\"margin: 0 0 1em;\">{message}</p>",
            $"<p style=\"margin: 0 0 1em;\"><a href=\"{link}\">{linkText}</a></p>",
            "<p style=\"margin: 0 0 0.25em;\">Thanks,</p>",
            "<p style=\"margin: 0;\">The Click2Approve team</p>",
            "</div>"
        );
    }
}
