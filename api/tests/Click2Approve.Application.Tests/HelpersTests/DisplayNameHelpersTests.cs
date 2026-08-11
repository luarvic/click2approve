using Click2Approve.Application.Helpers;

namespace Click2Approve.Application.Tests.HelpersTests;

public class DisplayNameHelpersTests
{
    [Fact]
    public void FormatParticipantDisplayName_WithEmployeeNameAndPosition_ReturnsEmployeeIdentity()
    {
        var displayName = DisplayNameHelpers.FormatParticipantDisplayName(
            "Taylor",
            "Jones",
            "Director",
            "taylor@example.com");

        Assert.Equal("Taylor Jones, Director", displayName);
    }

    [Fact]
    public void FormatParticipantDisplayName_WithoutEmployeeDetails_ReturnsEmail()
    {
        var displayName = DisplayNameHelpers.FormatParticipantDisplayName(
            firstName: null,
            lastName: null,
            position: null,
            email: "TAYLOR@EXAMPLE.COM");

        Assert.Equal("taylor@example.com", displayName);
    }
}
