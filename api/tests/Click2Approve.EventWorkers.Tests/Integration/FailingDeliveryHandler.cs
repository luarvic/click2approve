using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;

namespace Click2Approve.EventWorkers.Tests.Integration;

/// <summary>Simulates a notification provider outage while recording delivery attempts.</summary>
internal sealed class FailingDeliveryHandler : IEventHandler
{
    private int _attempts;
    public int Attempts => Volatile.Read(ref _attempts);
    public string EventType => "test.provider.failure.v1";

    public Task HandleAsync(EventEnvelope envelope, CancellationToken cancellationToken)
    {
        Interlocked.Increment(ref _attempts);
        throw new InvalidOperationException("Simulated email provider outage");
    }
}
