using Click2Approve.Application.Helpers;

namespace Click2Approve.EventConsumer.Services;

/// <summary>Resolves the deployment's shared branding asset for transactional email.</summary>
public static class EmailBranding
{
    /// <summary>Uses an explicit logo URL or the branded raster copy served by the existing frontend.</summary>
    public static string GetLogoUrl(IConfiguration configuration) => configuration["Email:LogoUrl"]
        ?? UriHelpers.GetUiUri(configuration.GetValue<Uri>("UI:BaseUrl"), configuration["UI:AppPath"], "logo-with-text.png").ToString();
}
