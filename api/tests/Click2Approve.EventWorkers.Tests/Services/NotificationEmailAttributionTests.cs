using Click2Approve.Application.Models.Emails;
using Click2Approve.Domain.Models;
using Click2Approve.EventConsumer.Services;

namespace Click2Approve.EventWorkers.Tests.Services;

/// <summary>Verifies user-name fallbacks and the separation of employee and personal identities.</summary>
public sealed class NotificationEmailAttributionTests
{
    [Theory]
    [InlineData("John", "Smith", "John Smith")]
    [InlineData(" John ", null, "John")]
    [InlineData(null, " Smith ", "Smith")]
    [InlineData(null, null, "person@example.com")]
    public void PersonalTenant_UsesProfileNameThenEmail(string? firstName, string? lastName, string expected)
    {
        var actor = Resolve(TenantType.Personal, firstName, lastName, "Old snapshot");
        Assert.Equal(expected, actor.DisplayName);
        Assert.Null(actor.OrganizationDisplayName);
        Assert.Null(actor.OrganizationLogoUrl);
    }

    [Theory]
    [InlineData("John Smith, CEO", "John Smith, CEO")]
    [InlineData("John, CEO", "John, CEO")]
    [InlineData("CEO", "CEO")]
    [InlineData("person@example.com", "person@example.com")]
    [InlineData(" ", "Account Name")]
    public void BusinessTenant_UsesEmployeeSnapshotFormattedBySharedDisplayNameRules(string snapshot, string expected)
    {
        var actor = Resolve(TenantType.Business, "Account", "Name", snapshot);
        Assert.Equal(expected, actor.DisplayName);
        Assert.Equal("Aurora", actor.OrganizationDisplayName);
    }

    private static EmailActor Resolve(TenantType type, string? firstName, string? lastName, string snapshot)
    {
        var user = new AppUser { FirstName = firstName, LastName = lastName, Email = " Person@Example.com " };
        var request = new ApprovalRequest
        {
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = 1,
            CreatedByDisplayName = snapshot,
            OrganizationDisplayName = "Aurora",
            Description = null,
            Title = "New car 1500",
            Status = ApprovalRequestStatus.Pending,
            Tenant = new Tenant { BusinessName = "Aurora", Type = type, SubscriptionPlan = SubscriptionPlan.PersonalFree }
        };
        return new AttributionResolver().Resolve(snapshot, user, request);
    }

    private sealed class AttributionResolver() : NotificationEmailService(null!, null!, null!, null!)
    {
        public EmailActor Resolve(string name, AppUser user, ApprovalRequest request) => CreateActor(name, user, request);
    }
}
