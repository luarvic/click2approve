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
        Assert.Equal($"John Smith {verb} Contract", model.Subject);
        Assert.Equal("Contract", model.RequestTitle);
        Assert.Contains("John Smith at Acme Inc.", model.Body);
    }

    [Theory]
    [InlineData(ApprovalRequestStatus.Completed, true, "Successful", "Request successful")]
    [InlineData(ApprovalRequestStatus.Completed, false, "Failed", "Request failed")]
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
        Assert.Equal("Your request titled ", model.Body);
        Assert.Contains("Your request titled <strong>Contract</strong>", EmailLayout.Render(model));
        if (result != true || status != ApprovalRequestStatus.Completed) Assert.DoesNotContain("successfully", model.Body);
    }

    [Fact]
    public void UnsuccessfulStepWithoutActor_DoesNotClaimCompletion()
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestStepCompleted,
            Context() with { Actor = null, Result = false });
        Assert.Equal("Step unsuccessful", model.Heading);
        Assert.Contains("A step in your request titled <strong>Contract</strong> was unsuccessful.", EmailLayout.Render(model));
        Assert.DoesNotContain("declined", EmailLayout.Render(model));
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
        Assert.Contains("font-size:36px", html);
        Assert.Contains("border-radius:999px;color:#ffffff!important;-webkit-text-fill-color:#ffffff", html);
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

    [Fact]
    public void Body_ShowsLinkedOrganizationLogoBeforeItsName()
    {
        var actor = new EmailActor
        {
            DisplayName = "John",
            AvatarUrl = "https://example.com/avatar.png",
            OrganizationDisplayName = "Acme",
            OrganizationLogoUrl = "https://example.com/org.png"
        };
        var sender = new EmailSenderIdentity
        {
            Name = "Acme <Inc>",
            IsOrganization = true,
            ImageUrl = "https://example.com/org.png",
            WebsiteUrl = "https://example.com/?a=1&b=2"
        };
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCreated,
            Context() with { Actor = actor, SenderIdentity = sender });
        var html = EmailLayout.Render(model with { SenderIdentity = sender }, "https://example.com/logo.png");
        Assert.Contains("https://example.com/logo.png", html);
        Assert.Contains("alt=\"Click2Approve\"", html);
        Assert.Contains("alt=\"Click2Approve\" height=\"48\" style=\"display:block;height:48px;border:0;\"", html);
        Assert.DoesNotContain("alt=\"Click2Approve\" width=", html);
        Assert.DoesNotContain("https://example.com/avatar.png", html);
        Assert.Contains("src=\"https://example.com/org.png\" alt=\"\" width=\"28\" height=\"28\"", html);
        Assert.Contains("</a>&nbsp;<span style=\"display:inline-block;vertical-align:middle;line-height:1.4;\">Acme &lt;Inc&gt;</span> requested", html);
        Assert.DoesNotContain("On behalf of", html);
        Assert.True(html.IndexOf("src=\"https://example.com/logo.png\"", StringComparison.Ordinal)
            < html.IndexOf("src=\"https://example.com/org.png\"", StringComparison.Ordinal));
        Assert.DoesNotContain(">+</td>", html);
        Assert.Contains("padding:2px;object-fit:contain;border-radius:50%", html);
        Assert.Contains("href=\"https://example.com/?a=1&amp;b=2\"", html);
        Assert.Contains("aria-label=\"Visit Acme &lt;Inc&gt; website\"", html);
        Assert.DoesNotContain(">From</td>", html);
        Assert.DoesNotContain(">Click2Approve</td>", html);
    }

    [Fact]
    public void SenderIdentity_OmitsMissingDetailsAndUnsafeLinks()
    {
        var sender = new EmailSenderIdentity
        {
            Name = "<Jane>",
            IsOrganization = true,
            ImageUrl = "https://example.com/logo.png",
            WebsiteUrl = "javascript:alert(2)"
        };
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCreated,
            Context() with { Actor = new EmailActor { DisplayName = "John" }, SenderIdentity = sender })
            with { SenderIdentity = sender };

        var html = EmailLayout.Render(model);

        Assert.DoesNotContain("On behalf of", html);
        Assert.DoesNotContain("javascript:", html);
        Assert.Contains("src=\"https://example.com/logo.png\"", html);
        Assert.DoesNotContain("Visit &lt;Jane&gt; website", html);
        Assert.Contains("&nbsp;<span style=\"display:inline-block;vertical-align:middle;line-height:1.4;\">&lt;Jane&gt;</span> requested", html);
    }

    [Fact]
    public void Body_ShowsPersonalAvatarBeforeUserName()
    {
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCreated,
            Context() with { Actor = new EmailActor { DisplayName = "Jane" } }) with
        {
            SenderIdentity = new EmailSenderIdentity
            {
                Name = "Jane",
                ImageUrl = "https://example.com/avatar.png"
            }
        };

        var html = EmailLayout.Render(model, "https://example.com/platform.png");

        Assert.Contains("src=\"https://example.com/platform.png\" alt=\"Click2Approve\" height=\"48\"", html);
        Assert.Contains("src=\"https://example.com/avatar.png\" alt=\"\" width=\"28\" height=\"28\"", html);
        Assert.Contains("</span>&nbsp;<span style=\"display:inline-block;vertical-align:middle;line-height:1.4;\">Jane</span> requested", html);
        Assert.DoesNotContain("On behalf of", html);
        Assert.True(html.IndexOf("src=\"https://example.com/platform.png\"", StringComparison.Ordinal)
            < html.IndexOf("src=\"https://example.com/avatar.png\"", StringComparison.Ordinal));
        Assert.DoesNotContain(">+</td>", html);
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
    public void Body_PlacesLogoBeforeOrganizationNameWhenItAlsoOccursInsideActorName()
    {
        var sender = new EmailSenderIdentity
        {
            Name = "A", IsOrganization = true, ImageUrl = "https://example.com/org.png"
        };
        var model = NotificationEmailTemplates.Create(NotificationType.ApprovalRequestTaskCreated,
            Context() with { Actor = new EmailActor { DisplayName = "Alex" }, SenderIdentity = sender })
            with { SenderIdentity = sender };

        var html = EmailLayout.Render(model);

        Assert.Contains("Alex at <span style=\"display:inline-block;vertical-align:middle;line-height:0;\"><img src=\"https://example.com/org.png\"", html);
        Assert.Contains("&nbsp;<span style=\"display:inline-block;vertical-align:middle;line-height:1.4;\">A</span> requested", html);
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
        RequestTitle = "Contract",
        ActionUrl = "https://example.com/app/requests",
        Actor = new EmailActor { DisplayName = "John Smith", OrganizationDisplayName = "Acme Inc." }
    };
}
