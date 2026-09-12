using System.Net;
using Click2Approve.Application.Models.Emails;

namespace Click2Approve.Application.Helpers;

/// <summary>Renders the shared email shell with encoded text and email-compatible inline styles.</summary>
public static class EmailLayout
{
    /// <summary>Renders an email without accepting raw HTML from callers.</summary>
    public static string Render(EmailTemplateModel model, string? logoUrl = null, string? logoLinkUrl = null)
    {
        var logo = SafeUrl(logoUrl) is { } url
            ? $"<img src=\"{Encode(url)}\" alt=\"Click2Approve\" width=\"48\" height=\"48\" style=\"display:block;border:0;\">"
            : "<span role=\"img\" aria-label=\"Click2Approve\" style=\"color:#15803d;font-size:40px;\">✓</span>";
        if (SafeUrl(logoLinkUrl) is { } linkUrl)
        {
            logo = $"<a href=\"{Encode(linkUrl)}\" style=\"display:inline-block;text-decoration:none;\">{logo}</a>";
        }
        return $$"""
            <!doctype html>
            <html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{{Encode(model.Subject)}}</title></head>
            <body style="margin:0;padding:0;background-color:#f3f4f6;color:#111827;font-family:Arial,Helvetica,sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f4f6"><tr><td align="center" style="padding:24px 12px;">
            <!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="max-width:600px;background-color:#ffffff;">
            <tr><td style="padding:32px 28px 36px;">
            {{logo}}
            </td></tr>
            <tr><td style="padding:0 28px 32px;font-size:16px;line-height:1.6;overflow-wrap:anywhere;">
            <h1 style="margin:0 0 24px;font-size:36px;line-height:1.15;font-weight:bold;">{{Encode(model.Heading)}}</h1>
            {{RenderBody(model)}}
            {{RenderContext(model)}}
            {{RenderButton(model.PrimaryActionText, model.PrimaryActionUrl)}}
            {{Paragraph(model.Details, "color:#4b5563;font-size:14px;")}}
            </td></tr>
            <tr><td style="border-top:1px solid #e5e7eb;padding:24px 28px;color:#6b7280;font-size:12px;line-height:1.6;">
            {{Encode(model.Footer)}}<br>© {{DateTime.UtcNow.Year}} Click2Approve
            </td></tr></table>
            <!--[if mso]></td></tr></table><![endif]-->
            </td></tr></table></body></html>
            """;
    }

    /// <summary>Allows only absolute web URLs in email links and images.</summary>
    public static string? SafeUrl(string? value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri) && (uri.Scheme == "https" || uri.Scheme == "http")
            ? uri.AbsoluteUri : null;

    private static string RenderBody(EmailTemplateModel model)
    {
        if (string.IsNullOrEmpty(model.RequestTitle)) return Paragraph(model.Body);
        return $"<p style=\"margin:0 0 24px;font-size:16px;line-height:1.6;\">{Encode(model.Body)}"
            + $"<strong>{Encode(model.RequestTitle)}</strong>{Encode(model.BodyAfterTitle)}</p>";
    }

    private static string RenderContext(EmailTemplateModel model) =>
        (string.IsNullOrWhiteSpace(model.MessagePreview) ? string.Empty
            : $"<blockquote style=\"margin:0 0 24px;padding:0 0 0 16px;border-left:3px solid #22c55e;color:#374151;\">“{Encode(model.MessagePreview)}”</blockquote>")
        + Paragraph(string.IsNullOrWhiteSpace(model.StepName) ? null : $"Step: {model.StepName}", "font-size:14px;color:#6b7280;");

    private static string RenderButton(string text, string url)
    {
        var safeUrl = SafeUrl(url) ?? throw new ArgumentException("Email actions require an absolute HTTP or HTTPS URL.", nameof(url));
        return $$"""
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;"><tr>
            <td align="center" bgcolor="#22C55E" style="border-radius:999px;mso-padding-alt:12px 24px;">
            <a href="{{Encode(safeUrl)}}" style="display:inline-block;padding:12px 24px;border:1px solid #22C55E;border-radius:999px;color:#ffffff!important;-webkit-text-fill-color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;mso-padding-alt:0;"><!--[if mso]><font color="#ffffff">{{Encode(text)}}</font><![endif]--><!--[if !mso]><!--><span style="background:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);background-clip:text;-webkit-background-clip:text;color:transparent!important;-webkit-text-fill-color:transparent;">{{Encode(text)}}</span><!--<![endif]--></a>
            </td></tr></table>
            """;
    }

    private static string Paragraph(string? text, string style = "") => string.IsNullOrWhiteSpace(text)
        ? string.Empty : $"<p style=\"margin:0 0 16px;{style}\">{Encode(text)}</p>";

    private static string Encode(string? text) => WebUtility.HtmlEncode(text) ?? string.Empty;
}
