using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Click2Approve.WebApi.Extensions;

/// <summary>
/// Describes framework-generated Identity account endpoints in Swagger.
/// </summary>
public sealed class IdentityAccountOperationFilter : IOperationFilter
{
    private static readonly IReadOnlyDictionary<string, string> Summaries = new Dictionary<string, string>
    {
        ["register"] = "Registers a new account.",
        ["login"] = "Signs in and issues authentication tokens or cookies.",
        ["refresh"] = "Refreshes an authentication token.",
        ["confirmEmail"] = "Confirms an account email address.",
        ["resendConfirmationEmail"] = "Resends an email confirmation link.",
        ["forgotPassword"] = "Sends a password reset link.",
        ["resetPassword"] = "Resets an account password.",
        ["manage/2fa"] = "Manages two-factor authentication.",
        ["manage/info:get"] = "Gets account information.",
        ["manage/info:post"] = "Updates account information."
    };

    private static readonly IReadOnlyDictionary<string, string> ParameterDescriptions = new Dictionary<string, string>
    {
        ["useCookies"] = "Issue authentication cookies instead of bearer tokens.",
        ["useSessionCookies"] = "Issue session cookies instead of bearer tokens.",
        ["userId"] = "The account ID from the confirmation link.",
        ["code"] = "The email confirmation code.",
        ["changedEmail"] = "The new email address, when confirming an email change."
    };

    /// <summary>
    /// Adds descriptions to endpoints supplied by ASP.NET Core Identity.
    /// </summary>
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var path = context.ApiDescription.RelativePath?.Split('?')[0];
        const string prefix = "account/";
        var index = path?.IndexOf(prefix, StringComparison.Ordinal);
        if (index is null or < 0)
        {
            return;
        }

        var action = path![(index.Value + prefix.Length)..];
        if (action == "manage/info")
        {
            action += $":{context.ApiDescription.HttpMethod?.ToLowerInvariant()}";
        }

        if (!Summaries.TryGetValue(action, out var summary))
        {
            return;
        }

        operation.Summary = summary;
        foreach (var parameter in operation.Parameters?.OfType<OpenApiParameter>() ?? [])
        {
            if (parameter.Name is { } name && ParameterDescriptions.TryGetValue(name, out var description))
            {
                parameter.Description = description;
            }
        }
    }
}
