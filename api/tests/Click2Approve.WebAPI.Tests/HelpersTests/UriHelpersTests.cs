using Click2Approve.WebAPI.Helpers;

namespace Click2Approve.WebAPI.Tests.HelpersTests;

public class UriHelpersTests
{
    [Fact]
    public void GetDerivedEmailConfirmationLink_ParametersAreMissing_ShouldThrow()
    {
        var uiBaseUri = new Uri("http://localhost:3333");
        var confirmationLink = new Uri("http://localhost:5555/without/expected/query/parameters");
        Assert.Throws<ArgumentException>(() => { UriHelpers.GetDerivedEmailConfirmationLink(confirmationLink, uiBaseUri); });
    }
}
