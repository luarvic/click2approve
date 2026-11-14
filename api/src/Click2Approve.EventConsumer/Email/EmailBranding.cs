using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Emails;

namespace Click2Approve.EventConsumer.Email;

/// <summary>Renders shared platform branding while preserving explicitly configured full-logo images.</summary>
public static class EmailBranding
{
    /// <summary>Uses an explicit full-logo URL or the icon displayed beside the live wordmark.</summary>
    public static string GetLogoUrl(IConfiguration configuration) => configuration["Email:LogoUrl"]
        ?? UriHelpers.GetUiUri(configuration.GetValue<Uri>("UI:BaseUrl"), configuration["UI:AppPath"], "logo-email.png").ToString();

    /// <summary>Uses HTML brand text for the default header so mail clients can adapt its dark-mode contrast.</summary>
    public static string Render(EmailTemplateModel model, IConfiguration configuration) => EmailLayout.Render(
        model,
        GetLogoUrl(configuration),
        configuration.GetValue<Uri>("UI:BaseUrl")?.ToString(),
        logoIncludesWordmark: !string.IsNullOrWhiteSpace(configuration["Email:LogoUrl"]));
}
