using System.Text.Json;
using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Exceptions;

namespace Click2Approve.Infrastructure.Events;

/// <summary>
/// Publishes application events to an Azure Storage Queue.
/// </summary>
public sealed class AzureEventQueue(IConfiguration configuration) : IEventQueue
{
    private readonly Dictionary<EventPriority, Lazy<Task<QueueClient>>> _queues = Enum.GetValues<EventPriority>()
        .ToDictionary(priority => priority, priority => new Lazy<Task<QueueClient>>(() => CreateAsync(configuration, priority, poison: false)));
    private readonly Dictionary<EventPriority, Lazy<Task<QueueClient>>> _poisonQueues = Enum.GetValues<EventPriority>()
        .ToDictionary(priority => priority, priority => new Lazy<Task<QueueClient>>(() => CreateAsync(configuration, priority, poison: true)));

    public async Task EnqueueAsync(EventPriority priority, EventEnvelope envelope, CancellationToken cancellationToken)
    {
        var queue = await _queues[priority].Value.WaitAsync(cancellationToken);
        await queue.SendMessageAsync(
            JsonSerializer.Serialize(envelope, EventJson.Options),
            cancellationToken: cancellationToken);
    }

    public async Task<IReadOnlyCollection<ReceivedEvent>> ReceiveAsync(
        EventPriority priority,
        int maximumCount,
        TimeSpan visibilityTimeout,
        CancellationToken cancellationToken)
    {
        var queue = await _queues[priority].Value.WaitAsync(cancellationToken);
        var response = await queue.ReceiveMessagesAsync(maximumCount, visibilityTimeout, cancellationToken);
        return [.. response.Value.Select(message => Map(priority, message))];
    }

    public async Task CompleteAsync(ReceivedEvent receivedEvent, CancellationToken cancellationToken)
    {
        var queue = await _queues[receivedEvent.Priority].Value.WaitAsync(cancellationToken);
        await queue.DeleteMessageAsync(receivedEvent.MessageId, receivedEvent.PopReceipt, cancellationToken);
    }

    public async Task RetryAsync(ReceivedEvent receivedEvent, TimeSpan delay, CancellationToken cancellationToken)
    {
        var queue = await _queues[receivedEvent.Priority].Value.WaitAsync(cancellationToken);
        await queue.UpdateMessageAsync(
            receivedEvent.MessageId,
            receivedEvent.PopReceipt,
            visibilityTimeout: delay,
            cancellationToken: cancellationToken);
    }

    public async Task MoveToPoisonAsync(ReceivedEvent receivedEvent, string error, CancellationToken cancellationToken)
    {
        var poisonQueue = await _poisonQueues[receivedEvent.Priority].Value.WaitAsync(cancellationToken);
        var poison = new PoisonEvent(receivedEvent.Envelope, receivedEvent.DequeueCount, error, DateTime.UtcNow);
        await poisonQueue.SendMessageAsync(
            JsonSerializer.Serialize(poison, EventJson.Options),
            cancellationToken: cancellationToken);
        await CompleteAsync(receivedEvent, cancellationToken);
    }

    private static ReceivedEvent Map(EventPriority priority, QueueMessage message)
    {
        var envelope = JsonSerializer.Deserialize<EventEnvelope>(message.MessageText, EventJson.Options)
            ?? throw new InfrastructureException("The event queue contains an invalid event envelope.");
        return new ReceivedEvent(envelope, priority, message.MessageId, message.PopReceipt, checked((int)message.DequeueCount));
    }

    private static async Task<QueueClient> CreateAsync(IConfiguration configuration, EventPriority priority, bool poison)
    {
        var connectionString = configuration["EventQueue:ConnectionString"]
            ?? throw new InfrastructureException("EventQueue configuration is invalid.");
        var queueName = configuration[$"EventQueue:Queues:{priority}:{(poison ? "PoisonName" : "Name")}"]
            ?? throw new InfrastructureException("EventQueue configuration is invalid.");
        var queue = new QueueClient(
            connectionString,
            queueName,
            new QueueClientOptions
            {
                MessageEncoding = QueueMessageEncoding.Base64
            });
        await queue.CreateIfNotExistsAsync();
        return queue;
    }

    private sealed record PoisonEvent(EventEnvelope Envelope, int DequeueCount, string Error, DateTime FailedAt);
}
