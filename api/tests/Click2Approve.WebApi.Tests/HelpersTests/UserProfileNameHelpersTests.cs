using Click2Approve.Application.Helpers;
using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Tests.HelpersTests;

public class UserProfileNameHelpersTests
{
    [Theory]
    [InlineData("john.smith@example.com", "John", "Smith")]
    [InlineData("john_smith@example.com", "John", "Smith")]
    [InlineData("john-smith@example.com", "John", "Smith")]
    [InlineData("johnSmith@example.com", "John", "Smith")]
    [InlineData("john.smith+approval@example.com", "John", "Smith")]
    [InlineData("john@example.com", "John", null)]
    public void ResolveFromEmail_ShouldResolveCommonEmailNames(string email, string? firstName, string? lastName)
    {
        var result = UserProfileNameHelpers.ResolveFromEmail(email);

        Assert.Equal(firstName, result.FirstName);
        Assert.Equal(lastName, result.LastName);
    }

    [Fact]
    public void ApplyMissingNamesFromEmail_ShouldPreserveExistingNames()
    {
        var user = new AppUser
        {
            Email = "john.smith@example.com",
            UserName = "john.smith@example.com",
            FirstName = "Existing",
            LastName = "Name",
        };

        UserProfileNameHelpers.ApplyMissingNamesFromEmail(user);

        Assert.Equal("Existing", user.FirstName);
        Assert.Equal("Name", user.LastName);
    }

    [Theory]
    [InlineData(" John ", "John")]
    [InlineData("", null)]
    [InlineData("   ", null)]
    [InlineData(null, null)]
    public void NormalizeOptional_ShouldTrimAndNullEmptyValues(string? value, string? expected)
    {
        var result = UserProfileNameHelpers.NormalizeOptional(value);

        Assert.Equal(expected, result);
    }
}
