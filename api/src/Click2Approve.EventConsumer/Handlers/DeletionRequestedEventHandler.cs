using System.Text.Json;
using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Application.Models.Events;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.EventConsumer.Handlers;

/// <summary>
/// Permanently removes scheduled user files.
/// </summary>
public class DeletionRequestedEventHandler(
    ApiDbContext db,
    IUserFileStorage fileStorage) : IEventHandler
{
    protected readonly ApiDbContext Db = db;
    protected readonly IUserFileStorage FileStorage = fileStorage;

    public string EventType => EventTypes.DeletionRequestedV1;

    public async Task HandleAsync(EventEnvelope envelope, CancellationToken cancellationToken)
    {
        var payload = JsonSerializer.Deserialize<DeletionRequestedPayload>(envelope.Payload, EventJson.Options)
            ?? throw new InvalidOperationException("The deletion event payload is invalid.");
        await HandleAsync(payload, cancellationToken);
    }

    protected virtual Task HandleAsync(DeletionRequestedPayload payload, CancellationToken cancellationToken) => payload.TargetType switch
    {
        DeletionTargetType.UserFile => DeleteUserFileAsync(payload.TargetGlobalId, cancellationToken),
        _ => throw new InvalidOperationException($"Unsupported deletion target '{payload.TargetType}'.")
    };

    protected virtual async Task DeleteUserFileAsync(Guid userFileGlobalId, CancellationToken cancellationToken)
    {
        var userFile = await Db.UserFiles.FirstOrDefaultAsync(file => file.GlobalId == userFileGlobalId, cancellationToken);
        if (userFile is null || userFile.ScheduledForDeletionAt is null) return;

        await FileStorage.DeleteAsync(userFile, cancellationToken);
        Db.UserFiles.Remove(userFile);
        await Db.SaveChangesAsync(cancellationToken);
    }
}
