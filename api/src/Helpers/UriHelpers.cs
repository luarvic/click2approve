using System.Web;

namespace api.Helpers;

public static class UriHelpers
{
    public static Uri GetDerivedEmailConfirmationLink(Uri confirmationLink, Uri? uiBaseUri)
    {
        if (uiBaseUri == null)
        {
            return confirmationLink;
        }
        var userId = HttpUtility.ParseQueryString(confirmationLink.Query).Get("userId");
        var code = HttpUtility.ParseQueryString(confirmationLink.Query).Get("code");
        if (userId == null)
        {
            throw new ArgumentException("Missing query parameter", userId);
        }
        if (code == null)
        {
            throw new ArgumentException("Missing query parameter", code);
        }
        return new Uri(uiBaseUri, $"confirmEmail?userId={userId}&code={code}");
    }
}
