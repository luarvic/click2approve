using Click2Approve.Application.Helpers;
using Click2Approve.Domain.Exceptions;

namespace Click2Approve.Application.Tests.HelpersTests;

/// <summary>
/// Tests email helper behavior.
/// </summary>
public class EmailHelpersTests
{
    [Fact]
    public void NormalizeEmailAddress_ShouldTrimAndReturnLowerInvariant()
    {
        var email = EmailHelpers.NormalizeEmailAddress("  Person@Example.COM  ");

        Assert.Equal("person@example.com", email);
    }

    [Fact]
    public void NormalizeIdentityEmailKey_ShouldTrimAndReturnLowerInvariant()
    {
        var email = EmailHelpers.NormalizeIdentityEmailKey("  Person@Example.COM  ");

        Assert.Equal("person@example.com", email);
    }

    [Fact]
    public void NormalizeEmailAddress_BlankEmail_ShouldThrowBusinessRuleException()
    {
        var exception = Assert.Throws<BusinessRuleException>(() =>
        {
            EmailHelpers.NormalizeEmailAddress(" ", requiredMessage: "Assignee email is required.");
        });

        Assert.Equal("Assignee email is required.", exception.Message);
    }
}
