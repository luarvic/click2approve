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

        return normalizedEmail.ToLowerInvariant();
    }

    /// <summary>Builds a safely encoded email using the shared transactional layout.</summary>
    public static string BuildHtmlEmail(string heading, string message, string link, string linkText) =>
        EmailLayout.Render(new Models.Emails.EmailTemplateModel
        {
            Subject = heading,
            Heading = heading,
            Body = message,
            PrimaryActionUrl = link,
            PrimaryActionText = linkText,
            Footer = "This email was delivered by Click2Approve."
        });
}
