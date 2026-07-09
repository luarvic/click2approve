using Click2Approve.Application.Helpers;
using Click2Approve.Domain.Exceptions;

namespace Click2Approve.WebApi.Tests.HelpersTests;

public class EmailHelpersTests
{
    [Fact]
    public void NormalizeEmailAddress_ShouldTrimAndReturnLowerInvariant()
    {
        var email = EmailHelpers.NormalizeEmailAddress("  Person@Example.COM  ");

        Assert.Equal("person@example.com", email);
    }

    [Fact]
    public void NormalizeIdentityEmailKey_ShouldTrimAndReturnUpperInvariant()
    {
        var email = EmailHelpers.NormalizeIdentityEmailKey("  Person@Example.COM  ");

        Assert.Equal("PERSON@EXAMPLE.COM", email);
    }

    [Fact]
    public void NormalizeEmailAddress_BlankEmail_ShouldThrowBusinessRuleException()
    {
        var exception = Assert.Throws<BusinessRuleException>(() =>
        {
            EmailHelpers.NormalizeEmailAddress(" ", requiredMessage: "Approver email is required.");
        });

        Assert.Equal("Approver email is required.", exception.Message);
    }
}
