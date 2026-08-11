using Hangfire.Common;
using Hangfire.Server;
using Hangfire.Storage;

namespace Click2Approve.Infrastructure.Notifications;

/// <summary>
/// Prevents concurrent executions of the notification email dispatch job.
/// </summary>
public sealed class NotificationEmailDispatchJobConcurrencyFilter(int timeoutInSeconds) : IServerFilter
{
    private const string LockHandleKey = nameof(NotificationEmailDispatchJobConcurrencyFilter);
    private readonly TimeSpan _timeout = timeoutInSeconds > 0
        ? TimeSpan.FromSeconds(timeoutInSeconds)
        : throw new ArgumentOutOfRangeException(nameof(timeoutInSeconds));

    /// <inheritdoc />
    public void OnPerforming(PerformingContext context)
    {
        if (context.BackgroundJob.Job.Type != typeof(NotificationEmailDispatchJob)) return;

        var resource = $"{typeof(NotificationEmailDispatchJob).FullName}.{nameof(NotificationEmailDispatchJob.DispatchAsync)}";
        context.Items[LockHandleKey] = context.Connection.AcquireDistributedLock(resource, _timeout);
    }

    /// <inheritdoc />
    public void OnPerformed(PerformedContext context)
    {
        if (context.BackgroundJob.Job.Type != typeof(NotificationEmailDispatchJob)) return;

        if (context.Items.TryGetValue(LockHandleKey, out var lockHandle))
        {
            (lockHandle as IDisposable)?.Dispose();
        }
    }
}
