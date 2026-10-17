using System.Globalization;
using Click2Approve.Application.Models.Emails;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Helpers;

/// <summary>Builds concise, action-aware content for each supported notification.</summary>
public static class NotificationEmailTemplates
{
    private const int MaximumPreviewCharacters = 200;

    /// <summary>Creates a notification template from event-specific context.</summary>
    public static EmailTemplateModel Create(NotificationType type, NotificationEmailContext context)
    {
        var title = context.RequestTitle;
        var actor = context.Actor ?? new EmailActor { IsSystemGenerated = true };
        var name = actor.Name;
        var senderName = context.SenderIdentity?.Name;
        var model = new EmailTemplateModel
        {
            Subject = string.Empty,
            Heading = string.Empty,
            Body = string.Empty,
            RequestTitle = title,
            BodyAfterTitle = ".",
            Actor = context.Actor,
            PrimaryActionText = "View request",
            PrimaryActionUrl = context.ActionUrl
        };
        return type switch
        {
            NotificationType.ApprovalRequestTaskCreated => TaskCreated(model, context),
            NotificationType.ApprovalRequestTaskCompleted => model with
            {
                Subject = $"Task completed automatically: {title}",
                Heading = "Task completed automatically",
                Body = "Your task for ",
                BodyAfterTitle = string.IsNullOrWhiteSpace(senderName)
                    ? " was completed automatically." : $" from {senderName} was completed automatically.",
                Actor = new EmailActor { IsSystemGenerated = true },
                Details = context.Reason
            },
            NotificationType.ApprovalRequestStepCompleted => StepCompleted(model, context, name),
            NotificationType.ApprovalRequestCompleted => RequestCompleted(model, context),
            NotificationType.ReceiptCreated => model with
            {
                Subject = $"New receipt: {title}",
                Heading = "New receipt",
                Body = string.IsNullOrWhiteSpace(senderName)
                    ? "A receipt is available for " : $"A receipt from {senderName} is available for ",
                BodyAfterTitle = ".",
                PrimaryActionText = "View receipt"
            },
            NotificationType.DiscussionMessageCreated => model with
            {
                Subject = actor.IsSystemGenerated || string.IsNullOrWhiteSpace(actor.DisplayName)
                    ? $"New message: {title}" : $"{name} commented on {title}",
                Heading = "New message",
                Body = context.Actor is null || actor.IsSystemGenerated
                    ? "There is a new message about " : $"{ActorLead(actor, context.SenderIdentity)} commented on ",
                BodyAfterTitle = context.Actor is null || actor.IsSystemGenerated
                    ? string.IsNullOrWhiteSpace(senderName) ? "." : $" on a request from {senderName}."
                    : ".",
                MessagePreview = TruncatePreview(context.Message),
                PrimaryActionText = "View conversation"
            },
            _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Unsupported notification type.")
        };
    }

    /// <summary>Normalizes whitespace and limits previews without splitting Unicode text elements.</summary>
    public static string? TruncatePreview(string? message)
    {
        if (string.IsNullOrWhiteSpace(message)) return null;
        var text = string.Join(" ", message.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
        var elements = StringInfo.ParseCombiningCharacters(text);
        return elements.Length <= MaximumPreviewCharacters ? text : text[..elements[MaximumPreviewCharacters - 1]].TrimEnd() + "…";
    }

    private static EmailTemplateModel TaskCreated(EmailTemplateModel model, NotificationEmailContext context)
    {
        var (heading, action) = context.Action switch
        {
            ApprovalRequestTaskAction.Approve => ("Approval requested", "approval"),
            ApprovalRequestTaskAction.Sign => ("Signature requested", "signature"),
            ApprovalRequestTaskAction.Confirm => ("Confirmation requested", "confirmation"),
            ApprovalRequestTaskAction.Acknowledge => ("Acknowledgment requested", "acknowledgment"),
            ApprovalRequestTaskAction.Review => ("Review requested", "review"),
            ApprovalRequestTaskAction.Verify => ("Verification requested", "verification"),
            ApprovalRequestTaskAction.Accept => ("Acceptance requested", "acceptance"),
            _ => ("Action required", "action")
        };
        var actor = ActorLead(context.Actor, context.SenderIdentity).TrimEnd(',');
        var requester = context.Requester is null ? null : ActorLead(context.Requester).TrimEnd(',');
        return model with
        {
            Subject = $"{heading}: {context.RequestTitle}",
            Body = $"{actor} requested your {action} on ",
            BodyAfterTitle = requester is null ? "." : $" for {requester}.",
            Heading = heading,
            PrimaryActionText = "Review request"
        };
    }

    private static EmailTemplateModel StepCompleted(EmailTemplateModel model, NotificationEmailContext context, string name)
    {
        var (heading, verb) = context.Result == false ? ("Request declined", "declined") : context.Action switch
        {
            ApprovalRequestTaskAction.Approve => ("Approval completed", "approved"),
            ApprovalRequestTaskAction.Sign => ("Signature completed", "signed"),
            ApprovalRequestTaskAction.Confirm => ("Confirmation completed", "confirmed"),
            ApprovalRequestTaskAction.Acknowledge => ("Acknowledgment completed", "acknowledged"),
            ApprovalRequestTaskAction.Review => ("Review completed", "reviewed"),
            ApprovalRequestTaskAction.Verify => ("Verification completed", "verified"),
            ApprovalRequestTaskAction.Accept => ("Acceptance completed", "accepted"),
            _ => ("Step completed", "completed")
        };
        // Older queued events have no source task. Do not invent a completing actor or action.
        var hasActor = context.Actor is { IsSystemGenerated: false } && !string.IsNullOrWhiteSpace(context.Actor.DisplayName);
        var scope = string.IsNullOrWhiteSpace(context.SenderIdentity?.Name)
            ? string.Empty : $" on a request from {context.SenderIdentity.Name}";
        var subject = context.Result == false
            ? hasActor ? $"{name} declined {context.RequestTitle}" : $"Declined: {context.RequestTitle}"
            : hasActor && context.Action is not null && context.Action != ApprovalRequestTaskAction.Complete
                ? $"{name} {verb} {context.RequestTitle}" : $"{context.StepName ?? "Step"} completed: {context.RequestTitle}";
        return model with
        {
            Subject = subject,
            Heading = heading,
            Body = hasActor
                ? (context.Action is null or ApprovalRequestTaskAction.Complete) && context.Result != false
                    ? $"{ActorLead(context.Actor, context.SenderIdentity)} completed a step in "
                    : $"{ActorLead(context.Actor, context.SenderIdentity)} {verb} the documents titled "
                : context.Result == false ? "The documents titled " : "A step in ",
            BodyAfterTitle = hasActor ? "." : context.Result == false
                ? $"{scope} were declined." : $"{scope} has been completed.",
            StepName = context.StepName
        };
    }

    private static EmailTemplateModel RequestCompleted(EmailTemplateModel model, NotificationEmailContext context)
    {
        var (subject, heading, ending) = context.Status switch
        {
            ApprovalRequestStatus.Canceled => ("Canceled", "Request canceled", " was canceled."),
            ApprovalRequestStatus.Superseded => ("Replaced", "Request replaced", " was replaced by a newer revision."),
            _ when context.Result == false => ("Declined", "Request declined", " was declined."),
            _ when context.Result == true => ("Completed", "Request completed", " has been completed successfully."),
            _ => ("Completed", "Request completed", " has been completed.")
        };
        return model with
        {
            Subject = $"{subject}: {context.RequestTitle}",
            Heading = heading,
            Body = string.IsNullOrWhiteSpace(context.SenderIdentity?.Name)
                ? "The request titled " : $"The request from {context.SenderIdentity.Name} titled ",
            BodyAfterTitle = ending
        };
    }

    private static string ActorLead(EmailActor? actor, EmailSenderIdentity? sender = null)
    {
        if (actor is null) return "Click2Approve";
        if (!actor.IsSystemGenerated && !string.IsNullOrWhiteSpace(actor.DisplayName)
            && sender is { IsOrganization: true } && !string.IsNullOrWhiteSpace(sender.Name))
        {
            return $"{actor.DisplayName} at {sender.Name},";
        }
        return !actor.IsSystemGenerated && !string.IsNullOrWhiteSpace(actor.DisplayName)
            && !string.IsNullOrWhiteSpace(actor.OrganizationDisplayName)
                ? $"{actor.DisplayName} at {actor.OrganizationDisplayName}," : actor.Name;
    }

}
