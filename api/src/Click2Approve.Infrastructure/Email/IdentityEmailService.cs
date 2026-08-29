using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.Infrastructure.Email;

/// <summary>
/// Implements IEmailSender interface of Identity framework.
/// </summary>
public class IdentityEmailService(
    IServiceScopeFactory scopeFactory) : IEmailSender<AppUser>
{
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;

    /// <summary>
    /// Sends an email confirmation link.
    /// </summary>
    public async Task SendConfirmationLinkAsync(AppUser user, string email, string confirmationLink)
    {
        await EnqueueAsync(new AccountEmailRequestedPayload(
            AccountEmailType.EmailConfirmation,
            email,
            ConfirmationLink: confirmationLink));
    }

    /// <summary>
    /// Sends a password reset code.
    /// </summary>
    public async Task SendPasswordResetCodeAsync(AppUser user, string email, string resetCode)
    {
        await EnqueueAsync(new AccountEmailRequestedPayload(
            AccountEmailType.PasswordReset,
            email,
            ResetCode: resetCode));
    }

    /// <summary>
    /// Sends a password reset link.
    /// </summary>
    public async Task SendPasswordResetLinkAsync(AppUser user, string email, string resetLink)
    {
        await EnqueueAsync(new AccountEmailRequestedPayload(
            AccountEmailType.PasswordReset,
            email,
            ResetLink: resetLink));
    }

    private async Task EnqueueAsync(AccountEmailRequestedPayload payload)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var eventOutboxRepository = scope.ServiceProvider.GetRequiredService<IEventOutboxRepository>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        await eventOutboxRepository.AddAsync(
            new EventOutboxMessage
            {
                EventId = Guid.NewGuid(),
                EventType = EventTypes.AccountEmailRequestedV1,
                OccurredAt = DateTime.UtcNow,
                Payload = System.Text.Json.JsonSerializer.Serialize(payload, EventJson.Options)
            },
            CancellationToken.None);
        await unitOfWork.SaveChangesAsync(CancellationToken.None);
    }
}
