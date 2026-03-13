namespace Click2Approve.WebApi.Helpers;

/// <summary>
/// Represents a set of static methods for email handling.
/// </summary>
public static class EmailHelpers
{
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
            "<p style=\"margin: 0;\">The click2approve team</p>",
            "</div>"
        );
    }
}
