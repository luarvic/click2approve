using Click2Approve.Application.Helpers;

namespace Click2Approve.WebApi.Tests.HelpersTests;

public class UriHelpersTests
{
    [Fact]
    public void GetUiUri_WithAppPath_ShouldAppendAppPathAndRoute()
    {
        var uiBaseUri = new Uri("http://localhost:3333");

        var link = UriHelpers.GetUiUri(uiBaseUri, "/app", "inbox").ToUri();

        Assert.Equal("http://localhost:3333/app/inbox", link.ToString());
    }

    [Fact]
    public void GetDerivedPasswordResetLink_WithAppPath_ShouldBuildAppRoute()
    {
        var uiBaseUri = new Uri("http://localhost:3333");

        var link = UriHelpers.GetDerivedPasswordResetLink("user@example.com", "test-code", uiBaseUri, "/app");

        Assert.StartsWith("http://localhost:3333/app/resetPassword", link.ToString());
    }

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
