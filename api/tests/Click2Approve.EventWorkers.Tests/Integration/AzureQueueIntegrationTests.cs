using Azure.Storage.Queues;
using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;
using Click2Approve.EventConsumer.Services;
using Click2Approve.Infrastructure.Events;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace Click2Approve.EventWorkers.Tests.Integration;

/// <summary>Exercises real queue receipts, redelivery, completion, and poison handling on isolated queues.</summary>
public sealed class AzureQueueIntegrationTests
{
    [AzuriteFact]
    public async Task Queue_RedeliversSameEventWithNewReceiptAndCompletesIt()
    {
        var connection = Environment.GetEnvironmentVariable("C2A_TEST_AZURITE")!;
        var name = $"c2a-tests-{Guid.NewGuid():N}";
        var client = new QueueClient(connection, name);
        try
        {
            var queue = CreateQueue(connection, name);
            var envelope = new EventEnvelope(Guid.NewGuid(), "test.event.v1", DateTime.UtcNow, "{}");
            await queue.EnqueueAsync(EventPriority.High, envelope, default);
            var first = Assert.Single(await queue.ReceiveAsync(EventPriority.High, 1, TimeSpan.FromSeconds(30), default));
            Assert.Empty(await queue.ReceiveAsync(EventPriority.High, 1, TimeSpan.FromSeconds(30), default));
            await queue.RetryAsync(first, TimeSpan.Zero, default);
            var second = Assert.Single(await queue.ReceiveAsync(EventPriority.High, 1, TimeSpan.FromSeconds(30), default));
            Assert.Equal(envelope.EventId, second.Envelope.EventId);
            Assert.Equal(first.MessageId, second.MessageId);
            Assert.NotEqual(first.PopReceipt, second.PopReceipt);
            Assert.Equal(2, second.DequeueCount);
            await queue.CompleteAsync(second, default);
            Assert.Equal(0, (await client.GetPropertiesAsync()).Value.ApproximateMessagesCount);
        }
        finally { await client.DeleteIfExistsAsync(); }
    }

    [AzuriteFact]
    public async Task Consumer_ProviderFailureRetriesThenPoisonsWithoutLosingEnvelope()
    {
        var connection = Environment.GetEnvironmentVariable("C2A_TEST_AZURITE")!;
        var name = $"c2a-tests-{Guid.NewGuid():N}";
        var source = new QueueClient(connection, name);
        var poison = new QueueClient(connection, name + "-poison", new QueueClientOptions { MessageEncoding = QueueMessageEncoding.Base64 });
        var configuration = Configuration(connection, name);
        var queue = new AzureEventQueue(configuration, new UnusedTokenCredential());
        var handler = new FailingDeliveryHandler();
        var services = new ServiceCollection();
        services.AddSingleton<IEventHandler>(handler);
        await using var provider = services.BuildServiceProvider();
        using var consumer = new EventQueueConsumerService(queue, provider.GetRequiredService<IServiceScopeFactory>(),
            configuration, NullLogger<EventQueueConsumerService>.Instance);
        var eventId = Guid.NewGuid();
        try
        {
            await poison.CreateIfNotExistsAsync();
            await queue.EnqueueAsync(EventPriority.High, new EventEnvelope(eventId, handler.EventType, DateTime.UtcNow, "{}"), default);
            await consumer.StartAsync(default);
            using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(15));
            // Poison publication precedes source deletion; stopping between them cancels the deletion.
            while ((await poison.GetPropertiesAsync(timeout.Token)).Value.ApproximateMessagesCount == 0
                || (await source.GetPropertiesAsync(timeout.Token)).Value.ApproximateMessagesCount != 0)
                await Task.Delay(50, timeout.Token);
            await consumer.StopAsync(timeout.Token);
            Assert.Equal(2, handler.Attempts);
            var message = (await poison.ReceiveMessageAsync(cancellationToken: timeout.Token)).Value;
            Assert.Contains(eventId.ToString(), message.MessageText);
            Assert.Contains("Simulated email provider outage", message.MessageText);
            Assert.Equal(0, (await source.GetPropertiesAsync(timeout.Token)).Value.ApproximateMessagesCount);
        }
        finally
        {
            await consumer.StopAsync(default);
            await source.DeleteIfExistsAsync();
            await poison.DeleteIfExistsAsync();
        }
    }

    private static AzureEventQueue CreateQueue(string connection, string name) =>
        new(Configuration(connection, name), new UnusedTokenCredential());

    private static IConfiguration Configuration(string connection, string name) =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["EventQueue:ConnectionString"] = connection,
            ["EventQueue:Queues:High:Name"] = name,
            ["EventQueue:Queues:High:PoisonName"] = name + "-poison",
            ["EventQueue:Consumer:Workers:High"] = "1",
            ["EventQueue:Consumer:MaximumAttempts"] = "2",
            ["EventQueue:Consumer:MaximumRetryDelaySeconds"] = "1",
            ["EventQueue:Consumer:VisibilityTimeoutSeconds"] = "10",
            ["EventQueue:Consumer:IdleDelaySeconds"] = "1"
        }).Build();
}
