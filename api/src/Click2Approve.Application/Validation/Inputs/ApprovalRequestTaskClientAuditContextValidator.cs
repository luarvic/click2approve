using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.Application.Validation.Inputs;

/// <summary>Validates ApprovalRequestTaskClientAuditContext before processing input.</summary>
public sealed class ApprovalRequestTaskClientAuditContextValidator : AbstractValidator<ApprovalRequestTaskClientAuditContext>
{
    public ApprovalRequestTaskClientAuditContextValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.Language).MaximumLength(ClientAuditLimits.ShortValue);
        RuleFor(value => value.Languages)
            .Must(values => values is null || values.Length <= ClientAuditLimits.LanguageCount)
            .WithMessage($"At most {ClientAuditLimits.LanguageCount} items are allowed.");
        RuleForEach(value => value.Languages).NotEmpty().MaximumLength(ClientAuditLimits.ShortValue);
        RuleFor(value => value.TimeZone).MaximumLength(FieldLimits.Name);
        RuleFor(value => value.Timestamp).MaximumLength(ClientAuditLimits.ShortValue);
        RuleFor(value => value.TimeZoneOffsetMinutes).InclusiveBetween(ClientAuditLimits.MinimumTimeZoneOffsetMinutes, ClientAuditLimits.MaximumTimeZoneOffsetMinutes);
        RuleFor(value => value.ScreenWidth).GreaterThanOrEqualTo(0);
        RuleFor(value => value.ScreenHeight).GreaterThanOrEqualTo(0);
        RuleFor(value => value.ViewportWidth).GreaterThanOrEqualTo(0);
        RuleFor(value => value.ViewportHeight).GreaterThanOrEqualTo(0);
        RuleFor(value => value.DevicePixelRatio).GreaterThanOrEqualTo(0);
        RuleFor(value => value.ColorDepth).GreaterThanOrEqualTo(0);
        RuleFor(value => value.Platform).MaximumLength(FieldLimits.Name);
        RuleFor(value => value.UserAgentPlatform).MaximumLength(FieldLimits.Name);
        RuleFor(value => value.ConnectionEffectiveType).MaximumLength(ClientAuditLimits.ShortValue);
        RuleFor(value => value.ConnectionDownlink).GreaterThanOrEqualTo(0);
        RuleFor(value => value.ConnectionRoundTripTime).GreaterThanOrEqualTo(0);
        RuleFor(value => value.Route).MaximumLength(FieldLimits.Url);
        RuleFor(value => value.BuildVersion).MaximumLength(ClientAuditLimits.ShortValue);
    }
}
