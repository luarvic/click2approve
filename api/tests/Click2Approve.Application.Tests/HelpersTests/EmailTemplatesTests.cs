using System.Globalization;
using System.Net;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Emails;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Tests.HelpersTests;

/// <summary>Verifies transactional email wording and untrusted content handling.</summary>
public sealed class EmailTemplatesTests
{
    [Theory]
    [InlineData(ApprovalRequestTaskAction.Approve, "Approval requested", "approval")]
    [InlineData(ApprovalRequestTaskAction.Sign, "Signature requested", "signature")]
    [InlineData(ApprovalRequestTaskAction.Confirm, "Confirmation requested", "confirmation")]
    [InlineData(ApprovalRequestTaskAction.Acknowledge, "Acknowledgment requested", "acknowledgment")]
    [InlineData(ApprovalRequestTaskAction.Review, "Review requested", "review")]
    [InlineData(ApprovalRequestTaskAction.Verify, "Verification requested", "verification")]
    [InlineData(ApprovalRequestTaskAction.Accept, "Acceptance requested", "acceptance")]
    [InlineData(ApprovalRequestTaskAction.Complete, "Action required", "action")]
    public void TaskCreated_ExplainsRequestedAction(ApprovalRequestTaskAction action, string heading, string noun)
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCreated, Context() with { Action = action });
        Assert.Equal("New task: Contract", model.Subject);
        Assert.Equal(heading, model.Heading);
        Assert.Equal("Contract", model.RequestTitle);
        Assert.Equal($"John Smith at Acme Inc. requested your {noun} on ", model.Body);
        Assert.Equal("Review request", model.PrimaryActionText);
    }

    [Theory]
    [InlineData(ApprovalRequestTaskAction.Approve, "approved")]
    [InlineData(ApprovalRequestTaskAction.Sign, "signed")]
    [InlineData(ApprovalRequestTaskAction.Confirm, "confirmed")]
    [InlineData(ApprovalRequestTaskAction.Acknowledge, "acknowledged")]
    [InlineData(ApprovalRequestTaskAction.Review, "reviewed")]
    [InlineData(ApprovalRequestTaskAction.Verify, "verified")]
    [InlineData(ApprovalRequestTaskAction.Accept, "accepted")]
    public void StepCompleted_UsesActualActorAndAction(ApprovalRequestTaskAction action, string verb)
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestStepCompleted,
            Context() with { Action = action, Result = true });
        Assert.Equal("Step succeeded: Contract", model.Subject);
        Assert.Contains(verb, model.Body);
        Assert.Equal("Contract", model.RequestTitle);
        Assert.Contains("John Smith at Acme Inc.", model.Body);
    }

    [Theory]
    [InlineData(ApprovalRequestStatus.Completed, true, "Succeeded", "Request succeeded")]
    [InlineData(ApprovalRequestStatus.Completed, false, "Failed", "Request failed")]
    [InlineData(ApprovalRequestStatus.Completed, null, "Completed", "Request completed")]
    [InlineData(ApprovalRequestStatus.Canceled, null, "Canceled", "Request canceled")]
    [InlineData(ApprovalRequestStatus.Superseded, true, "Replaced", "Request replaced")]
    public void RequestCompleted_ReflectsResult(ApprovalRequestStatus status, bool? result, string subject, string heading)
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestCompleted,
            Context() with { Status = status, Result = result });
        Assert.Equal($"{heading}: Contract", model.Subject);
        Assert.Contains(subject, heading, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(heading, model.Heading);
        Assert.Equal("Contract", model.RequestTitle);
        Assert.Equal("Your request titled ", model.Body);
        Assert.Contains("Your request titled <strong>Contract</strong>", EmailLayout.Render(model));
        if (result != true || status != ApprovalRequestStatus.Completed) Assert.DoesNotContain("successfully", model.Body);
    }

    [Fact]
    public void FailedStepWithoutActor_DoesNotClaimCompletion()
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestStepCompleted,
            Context() with { Actor = null, Result = false });
        Assert.Equal("Step failed", model.Heading);
        Assert.Contains("A step in your request titled <strong>Contract</strong> failed.", EmailLayout.Render(model));
        Assert.DoesNotContain("declined", EmailLayout.Render(model));
    }

    [Fact]
    public void SucceededStepWithoutActor_UsesOutcomeWording()
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestStepCompleted,
            Context() with { Actor = null, Result = true });
        Assert.Equal("Step succeeded", model.Heading);
        Assert.Contains("A step in your request titled <strong>Contract</strong> succeeded.", EmailLayout.Render(model));
    }

    [Theory]
    [InlineData(true, "Request succeeded", "succeeded.")]
    [InlineData(false, "Request failed", "failed.")]
    public void RequestCompleted_IncludesOrganizationAsText(bool result, string heading, string ending)
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestCompleted,
            Context() with
            {
                Status = ApprovalRequestStatus.Completed,
                Result = result,
                SenderIdentity = new EmailSenderIdentity
                {
                    Name = "Aurora <2026>", IsOrganization = true, ImageUrl = "https://example.com/aurora.png"
                }
            });
        Assert.Equal(heading, model.Heading);
        Assert.Contains($"<strong>Contract</strong> at Aurora &lt;2026&gt; {ending}", EmailLayout.Render(model));
    }

    [Fact]
    public void AutomaticCompletion_NeverAttributesToSuppliedUser()
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCompleted,
            Context() with { Reason = "The request was declined." });
        var html = EmailLayout.Render(model);
        Assert.True(model.Actor!.IsSystemGenerated);
        Assert.Contains("was completed automatically.", html);
        Assert.DoesNotContain("John Smith", html);
        Assert.Contains("The request was declined.", html);
    }

    [Theory]
    [InlineData("John Smith", null, "John Smith requested your signature on ")]
    [InlineData("John Smith, CEO", "Aurora", "John Smith, CEO at Aurora requested your signature on ")]
    [InlineData(null, "Aurora", "Aurora requested your signature on ")]
    public void SignatureRequest_UsesProseAndAnInlineBoldTitle(string? name, string? organization, string expected)
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCreated, Context() with
        {
            Action = ApprovalRequestTaskAction.Sign,
            RequestTitle = "New car 1500",
            Actor = new EmailActor { DisplayName = name, OrganizationDisplayName = organization }
        });
        var html = WebUtility.HtmlDecode(EmailLayout.Render(model));
        Assert.Contains(expected + "<strong>New car 1500</strong>.", html);
        Assert.DoesNotContain(">by</p>", html);
        Assert.DoesNotContain("via Click2Approve", html);
        Assert.DoesNotContain("From:", html);
        Assert.Contains("font-size:28px", html);
        Assert.Contains("border-radius:6px;color:#ffffff!important;-webkit-text-fill-color:#ffffff", html);
        Assert.Contains("<!--[if mso]><font color=\"#ffffff\">Review request</font><![endif]-->", html);
        Assert.Contains("background-image:linear-gradient(#ffffff,#ffffff);background-clip:text;-webkit-background-clip:text", html);
    }

    [Fact]
    public void Layout_EncodesDynamicContentAndRejectsUnsafeUrls()
    {
        var model = new EmailTemplateModel
        {
            Subject = "<subject>",
            Heading = "<heading>",
            Body = "<script>alert(1)</script>",
            RequestTitle = "<request>",
            StepName = "<step>",
            MessagePreview = "<preview>",
            Details = "<details>",
            Footer = "<footer>",
            PrimaryActionText = "<action>",
            PrimaryActionUrl = "https://example.com/?code=a%2Bb&email=a%40b.com",
            Actor = new EmailActor { DisplayName = "<actor>", OrganizationDisplayName = "<org>", AvatarUrl = "javascript:alert(1)" }
        };
        var html = EmailLayout.Render(model, "https://example.com/logo.png");
        foreach (var value in new[] { "subject", "heading", "script", "request", "step", "preview", "details", "footer", "action" })
        {
            Assert.DoesNotContain($"<{value}>", html);
            Assert.Contains($"&lt;{value}&gt;", html);
        }
        Assert.DoesNotContain("javascript:", html);
        Assert.Contains("code=a%2Bb&amp;email=a%40b.com", html);
        Assert.Throws<ArgumentException>(() => EmailLayout.Render(model with { PrimaryActionUrl = "javascript:alert(1)" }));
        Assert.Contains("max-width:600px", html);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Body_KeepsSenderAttributionAsEncodedText(bool isOrganization)
    {
        var sender = new EmailSenderIdentity
        {
            Name = "<Jane>",
            IsOrganization = isOrganization,
            ImageUrl = "https://example.com/sender.png",
            WebsiteUrl = "javascript:alert(2)"
        };
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCreated,
            Context() with { Actor = new EmailActor { DisplayName = "<Jane>" }, SenderIdentity = sender })
            with { SenderIdentity = sender };
        var html = EmailLayout.Render(model, "https://example.com/platform.png");

        Assert.Contains("&lt;Jane&gt;", html);
        Assert.DoesNotContain("<Jane>", html);
        Assert.DoesNotContain("sender.png", html);
        Assert.DoesNotContain("javascript:", html);
        Assert.Contains("src=\"https://example.com/platform.png\"", html);
    }

    [Fact]
    public void Header_LinksPlatformLogoToTheConfiguredBaseUrl()
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCreated, Context());

        var html = EmailLayout.Render(model, "https://example.com/logo.png", "https://click2approve.com");

        Assert.Contains("<a href=\"https://click2approve.com/\"", html);
        Assert.Contains("<img src=\"https://example.com/logo.png\"", html);
        Assert.DoesNotContain("On behalf of", html);
    }

    [Fact]
    public void Footer_MatchesAppNavigationAndKeepsSecurityNoteInTheContent()
    {
        var model = AccountEmailTemplates.Create(AccountEmailType.PasswordReset, "https://api.example.com/reset?code=secret");
        var html = EmailLayout.Render(model, "https://cdn.example.com/logo.png", "https://ui.example.com/?tracking=value");

        Assert.Contains($"© {DateTime.UtcNow.Year} Click2Approve. All rights reserved.", html);
        (string Label, string Path)[] links =
        [
            ("Home", "/"), ("App", "/app/"), ("Docs", "/docs/"),
            ("Contact", "/contact/"), ("Terms", "/terms/"), ("Privacy", "/privacy/")
        ];
        foreach (var (label, path) in links)
        {
            Assert.Matches($"href=\"https://ui\\.example\\.com{path}\"[^>]*>{label}</a>", html);
        }
        var footerPosition = html.IndexOf("border-top:1px", StringComparison.Ordinal);
        Assert.Contains(WebUtility.HtmlEncode(model.Footer), html[..footerPosition]);
        Assert.DoesNotContain("code=secret", html[footerPosition..]);
        Assert.DoesNotContain("tracking=value", html[footerPosition..]);
        Assert.DoesNotContain("cdn.example.com", html[footerPosition..]);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("javascript:alert(1)")]
    [InlineData("/relative")]
    public void Footer_WithoutAValidSiteUrl_DoesNotInventNavigation(string? siteUrl)
    {
        var model = AccountEmailTemplates.Create(AccountEmailType.PasswordReset, "https://example.com/reset");
        var html = EmailLayout.Render(model, logoLinkUrl: siteUrl);

        Assert.Contains("Click2Approve. All rights reserved.", html);
        Assert.DoesNotContain(">Privacy</a>", html);
        Assert.DoesNotContain("javascript:", html);
    }

    [Fact]
    public void Body_ShowsSenderNameWhenImageIsMissing()
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCreated,
            Context() with { Actor = new EmailActor { DisplayName = "Jane Doe" } }) with
        {
            SenderIdentity = new EmailSenderIdentity { Name = "Jane Doe" }
        };

        var html = EmailLayout.Render(model);

        Assert.Contains("Jane Doe requested", html);
        Assert.DoesNotContain("On behalf of", html);
    }

    [Fact]
    public void InlineTitle_EncodesAllPartsAndDoesNotBoldMatchingActorText()
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCreated, Context() with
        {
            Actor = new EmailActor { DisplayName = "<John>", OrganizationDisplayName = "<Acme>" },
            RequestTitle = "<John>"
        });
        var html = EmailLayout.Render(model);
        Assert.Contains("&lt;John&gt; at &lt;Acme&gt; requested", html);
        Assert.Contains("on <strong>&lt;John&gt;</strong>.", html);
        Assert.DoesNotContain("<John>", html);
        Assert.DoesNotContain("<Acme>", html);
    }

    [Fact]
    public void DiscussionPreview_IsBoundedAndPreservesUnicode()
    {
        var preview = NotificationEmailTemplates.TruncatePreview(string.Concat(Enumerable.Repeat("👩‍💻", 250)));
        Assert.Equal(200, StringInfo.ParseCombiningCharacters(preview!).Length);
        Assert.EndsWith("…", preview);
        Assert.Equal("Hello world", NotificationEmailTemplates.TruncatePreview("  Hello\r\n world  "));
        var model = NotificationEmailTemplates.Create(NotificationType.DiscussionMessageCreated, Context() with { Message = "<script>Hi</script>" });
        Assert.Equal("New message: Contract", model.Subject);
        Assert.Equal("View conversation", model.PrimaryActionText);
        Assert.DoesNotContain("<script>", EmailLayout.Render(model));
    }

    [Theory]
    [InlineData(AccountEmailType.EmailConfirmation, "Confirm your Click2Approve email", "create this account")]
    [InlineData(AccountEmailType.PasswordReset, "Reset your Click2Approve password", "password reset")]
    [InlineData(AccountEmailType.EmailChangeConfirmation, "Confirm your new Click2Approve email", "email change")]
    [InlineData(AccountEmailType.EmployeeInvitation, "You have been invited to Click2Approve", "invitation")]
    public void AccountEmails_UsePlatformBrandingAndSecurityFooter(AccountEmailType type, string subject, string footer)
    {
        var model = AccountEmailTemplates.Create(type, "https://example.com/callback");
        Assert.Equal(subject, model.Subject);
        Assert.Null(model.Actor);
        Assert.Contains(footer, model.Footer);
        Assert.DoesNotContain("via Click2Approve", EmailLayout.Render(model));
    }

    private static NotificationEmailContext Context() => new()
    {
        RequestTitle = "Contract",
        ActionUrl = "https://example.com/app/requests",
        Actor = new EmailActor { DisplayName = "John Smith", OrganizationDisplayName = "Acme Inc." }
    };
}
