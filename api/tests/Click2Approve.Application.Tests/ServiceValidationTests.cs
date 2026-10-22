using Click2Approve.Application.Models.Commands.Notifications;
using Click2Approve.Application.Services.Notifications;
using Click2Approve.Domain.Models;
using FluentValidation;

namespace Click2Approve.Application.Tests;

/// <summary>Verifies services honor injected asynchronous validation before persistence.</summary>
public class ServiceValidationTests
{
    [Fact]
    public async Task ListUsesInjectedValidatorAndPassesCancellationBeforeRepositoryAccess()
    {
        using var cancellation = new CancellationTokenSource();
        var query = new InAppNotificationListQueryCommand();
        var validator = new InlineValidator<InAppNotificationListQueryCommand>();
        validator.RuleFor(value => value).CustomAsync(async (value, context, token) =>
        {
            await Task.Yield();
            Assert.Same(query, value);
            Assert.Equal(cancellation.Token, token);
            context.AddFailure("Page", "Rejected by the injected validator.");
        });
        // Any repository access would fail, proving validation stops the operation first.
        var service = new NotificationService(null!, null!, null!, validator);

        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            service.ListInAppAsync(new AppUser(), 1, query, cancellation.Token));

        var failure = Assert.Single(exception.Errors);
        Assert.Equal("Page", failure.PropertyName);
        Assert.Equal("Rejected by the injected validator.", failure.ErrorMessage);
    }
}
