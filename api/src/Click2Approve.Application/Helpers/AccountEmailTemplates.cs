using Click2Approve.Application.Models.Emails;
using Click2Approve.Application.Models.Events;

namespace Click2Approve.Application.Helpers;

/// <summary>Builds platform-only account and security email content.</summary>
public static class AccountEmailTemplates
{
    /// <summary>Creates account content without displaying a business actor.</summary>
    public static EmailTemplateModel Create(AccountEmailType type, string actionUrl, string? tenantName = null, bool isNewUser = false)
    {
        var model = new EmailTemplateModel
        {
            Subject = "Confirm your Click2Approve email",
            Heading = "Confirm your email",
            Body = "Confirm your email address to finish setting up your Click2Approve account.",
            PrimaryActionText = "Confirm email",
            PrimaryActionUrl = actionUrl,
            Footer = "If you didn't create this account, you can ignore this email."
        };
        return type switch
        {
            AccountEmailType.EmailConfirmation => model,
            AccountEmailType.PasswordReset => model with
            {
                Subject = "Reset your Click2Approve password",
                Heading = "Reset your password",
                Body = "We received a request to reset the password for your Click2Approve account.",
                PrimaryActionText = "Reset password",
                Footer = "If you didn't request a password reset, you can safely ignore this email."
            },
            AccountEmailType.EmailChangeConfirmation => model with
            {
                Subject = "Confirm your new Click2Approve email",
                Heading = "Confirm your new email",
                Body = "Confirm this email address to update the email associated with your Click2Approve account.",
                Footer = "If you didn't request this email change, you can ignore this email."
            },
            AccountEmailType.EmployeeInvitation => model with
            {
                Subject = "You have been invited to Click2Approve",
                Heading = "You're invited",
                Body = string.IsNullOrWhiteSpace(tenantName) ? "You've been invited to join an organization on Click2Approve."
                    : $"You've been invited to join {tenantName} on Click2Approve.",
                PrimaryActionText = isNewUser ? "Sign up" : "Sign in",
                Footer = "If you weren't expecting this invitation, you can ignore this email."
            },
            _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Unsupported account email type.")
        };
    }
}
