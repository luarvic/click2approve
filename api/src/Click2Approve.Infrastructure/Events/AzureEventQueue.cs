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
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly Lazy<Task<QueueClient>> _queue = new(() => CreateAsync(configuration));
    private readonly Lazy<Task<QueueClient>> _poisonQueue = new(() => CreateAsync(configuration, "PoisonName"));

    /// <inheritdoc />
    public async Task EnqueueAsync(EventEnvelope envelope, CancellationToken cancellationToken)
    {
        var queue = await _queue.Value.WaitAsync(cancellationToken);
        await queue.SendMessageAsync(JsonSerializer.Serialize(envelope, JsonOptions), cancellationToken: cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyCollection<ReceivedEvent>> ReceiveAsync(
        int maximumCount,
        TimeSpan visibilityTimeout,
        CancellationToken cancellationToken)
    {
        var queue = await _queue.Value.WaitAsync(cancellationToken);
        var response = await queue.ReceiveMessagesAsync(maximumCount, visibilityTimeout, cancellationToken);
        return [.. response.Value.Select(Map)];
    }

    /// <inheritdoc />
    public async Task CompleteAsync(ReceivedEvent receivedEvent, CancellationToken cancellationToken)
    {
        var queue = await _queue.Value.WaitAsync(cancellationToken);
        await queue.DeleteMessageAsync(receivedEvent.MessageId, receivedEvent.PopReceipt, cancellationToken);
    }

    /// <inheritdoc />
    public async Task RetryAsync(ReceivedEvent receivedEvent, TimeSpan delay, CancellationToken cancellationToken)
    {
        var queue = await _queue.Value.WaitAsync(cancellationToken);
        await queue.UpdateMessageAsync(
            receivedEvent.MessageId,
            receivedEvent.PopReceipt,
            visibilityTimeout: delay,
            cancellationToken: cancellationToken);
    }

    /// <inheritdoc />
    public async Task MoveToPoisonAsync(ReceivedEvent receivedEvent, string error, CancellationToken cancellationToken)
    {
        var poisonQueue = await _poisonQueue.Value.WaitAsync(cancellationToken);
        var poison = new PoisonEvent(receivedEvent.Envelope, receivedEvent.DequeueCount, error, DateTime.UtcNow);
        await poisonQueue.SendMessageAsync(JsonSerializer.Serialize(poison, JsonOptions), cancellationToken: cancellationToken);
        await CompleteAsync(receivedEvent, cancellationToken);
    }

    private static ReceivedEvent Map(QueueMessage message)
    {
        var envelope = JsonSerializer.Deserialize<EventEnvelope>(message.MessageText, JsonOptions)
            ?? throw new InfrastructureException("The event queue contains an invalid event envelope.");
        return new ReceivedEvent(envelope, message.MessageId, message.PopReceipt, checked((int)message.DequeueCount));
    }

    private static async Task<QueueClient> CreateAsync(IConfiguration configuration, string nameKey = "Name")
    {
        var connectionString = configuration["EventQueue:ConnectionString"]
            ?? throw new InfrastructureException("EventQueue configuration is invalid.");
        var queueName = configuration[$"EventQueue:{nameKey}"]
            ?? throw new InfrastructureException("EventQueue configuration is invalid.");
        var queue = new QueueClient(connectionString, queueName);
        await queue.CreateIfNotExistsAsync();
        return queue;
    }

    private sealed record PoisonEvent(EventEnvelope Envelope, int DequeueCount, string Error, DateTime FailedAt);
}
