using Click2Approve.Application.Helpers;

namespace Click2Approve.WebApi.Tests.HelpersTests;

public class UriHelpersTests
{
    [Fact]
    public void GetDerivedEmailConfirmationLink_UserIdIsMissing_ShouldThrowArgumentException()
    {
        var uiBaseUri = new Uri("http://localhost:3333");
        var confirmationLink = new Uri("http://localhost:5555/confirmEmail?code=test-code");
        var exception = Assert.Throws<ArgumentException>(() =>
        {
            UriHelpers.GetDerivedEmailConfirmationLink(confirmationLink, uiBaseUri);
        });

        Assert.Equal("confirmationLink", exception.ParamName);
    }

    [Fact]
    public void GetDerivedEmailConfirmationLink_CodeIsMissing_ShouldThrowArgumentException()
    {
        var uiBaseUri = new Uri("http://localhost:3333");
        var confirmationLink = new Uri("http://localhost:5555/confirmEmail?userId=test-user-id");
        var exception = Assert.Throws<ArgumentException>(() =>
        {
            UriHelpers.GetDerivedEmailConfirmationLink(confirmationLink, uiBaseUri);
        });

        Assert.Equal("confirmationLink", exception.ParamName);
    }
}
