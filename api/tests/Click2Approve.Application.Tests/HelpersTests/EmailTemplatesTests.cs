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
        Assert.Equal($"{heading}: Contract", model.Subject);
        Assert.Equal(heading, model.Heading);
        Assert.Equal("Contract", model.RequestTitle);
        Assert.Equal($"John Smith at Acme Inc., requested your {noun} on ", model.Body);
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
        Assert.Equal($"John Smith {verb} Contract", model.Subject);
        Assert.Equal("Contract", model.RequestTitle);
        Assert.Contains("John Smith at Acme Inc.", model.Body);
    }

    [Theory]
    [InlineData(ApprovalRequestStatus.Completed, true, "Completed", "Request completed")]
    [InlineData(ApprovalRequestStatus.Completed, false, "Declined", "Request declined")]
    [InlineData(ApprovalRequestStatus.Completed, null, "Completed", "Request completed")]
    [InlineData(ApprovalRequestStatus.Canceled, null, "Canceled", "Request canceled")]
    [InlineData(ApprovalRequestStatus.Superseded, true, "Replaced", "Request replaced")]
    public void RequestCompleted_ReflectsResult(ApprovalRequestStatus status, bool? result, string subject, string heading)
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestCompleted,
            Context() with { Status = status, Result = result });
        Assert.Equal($"{subject}: Contract", model.Subject);
        Assert.Equal(heading, model.Heading);
        Assert.Equal("Contract", model.RequestTitle);
        if (result != true || status != ApprovalRequestStatus.Completed) Assert.DoesNotContain("successfully", model.Body);
    }

    [Fact]
    public void DeclinedStepWithoutActor_DoesNotClaimCompletion()
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestStepCompleted,
            Context() with { Actor = null, Result = false });
        Assert.Equal("Request declined", model.Heading);
        Assert.Contains("<strong>Contract</strong> were declined.", EmailLayout.Render(model));
        Assert.DoesNotContain("has been completed", EmailLayout.Render(model));
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
    [InlineData("John Smith, CEO", "Aurora", "John Smith, CEO at Aurora, requested your signature on ")]
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
        Assert.Contains("font-size:36px", html);
        Assert.Contains("border-radius:999px;color:#ffffff", html);
    }

    [Fact]
    public void Layout_EncodesDynamicContentAndRejectsUnsafeUrls()
    {
        var model = new EmailTemplateModel
        {
            Subject = "<subject>", Heading = "<heading>", Body = "<script>alert(1)</script>",
            RequestTitle = "<request>", StepName = "<step>", MessagePreview = "<preview>", Details = "<details>", Footer = "<footer>",
            PrimaryActionText = "<action>", PrimaryActionUrl = "https://example.com/?code=a%2Bb&email=a%40b.com",
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

    [Fact]
    public void Header_UsesOnlyPlatformLogoAndNoActorImages()
    {
        var actor = new EmailActor
        {
            DisplayName = "John", AvatarUrl = "https://example.com/avatar.png",
            OrganizationDisplayName = "Acme", OrganizationLogoUrl = "https://example.com/org.png"
        };
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCreated, Context() with { Actor = actor });
        var html = EmailLayout.Render(model, "https://example.com/logo.png");
        Assert.Contains("https://example.com/logo.png", html);
        Assert.Contains("alt=\"Click2Approve\"", html);
        Assert.DoesNotContain("https://example.com/avatar.png", html);
        Assert.DoesNotContain("https://example.com/org.png", html);
        Assert.DoesNotContain(">Click2Approve</td>", html);
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
        Assert.Contains("&lt;John&gt; at &lt;Acme&gt;, requested", html);
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
        Assert.Equal("John Smith commented on Contract", model.Subject);
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
        RequestTitle = "Contract", ActionUrl = "https://example.com/app/requests",
        Actor = new EmailActor { DisplayName = "John Smith", OrganizationDisplayName = "Acme Inc." }
    };
}
