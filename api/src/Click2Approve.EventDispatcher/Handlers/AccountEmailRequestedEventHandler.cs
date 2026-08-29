using System.Text.Json;
using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;
using Click2Approve.EventDispatcher.Services;

namespace Click2Approve.EventDispatcher.Handlers;

/// <summary>
/// Dispatches account email requests from the event queue.
/// </summary>
public sealed class AccountEmailRequestedEventHandler(AccountEmailService accountEmailService) : IEventHandler
{
    private readonly AccountEmailService _accountEmailService = accountEmailService;

    /// <inheritdoc />
    public string EventType => EventTypes.AccountEmailRequestedV1;

    /// <inheritdoc />
    public async Task HandleAsync(EventEnvelope envelope, CancellationToken cancellationToken)
    {
        var payload = JsonSerializer.Deserialize<AccountEmailRequestedPayload>(envelope.Payload, EventJson.Options)
            ?? throw new InvalidOperationException("The account email event payload is invalid.");
        await _accountEmailService.SendAsync(payload, cancellationToken);
    }
}
