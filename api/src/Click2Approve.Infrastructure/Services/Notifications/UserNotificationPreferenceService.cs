using Click2Approve.Application.Models.DTOs;
using Click2Approve.Application.Services.Notifications;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Services.Notifications;

/// <summary>
/// Implements user notification preference operations.
/// </summary>
public class UserNotificationPreferenceService(ApiDbContext db) : IUserNotificationPreferenceService
{
    private readonly ApiDbContext _db = db;

    public async Task<List<UserNotificationPreferenceDto>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var savedPreferences = await _db.UserNotificationPreferences
            .AsNoTracking()
            .Where(preference => preference.UserId == user.Id)
            .ToListAsync(cancellationToken);

        return [.. AllEmailTypes().Select(type =>
        {
            var preference = savedPreferences.FirstOrDefault(p => p.Type == type && p.Channel == NotificationChannel.Email);
            return new UserNotificationPreferenceDto
            {
                Type = type,
                Channel = NotificationChannel.Email,
                IsEnabled = preference?.IsEnabled ?? true
            };
        })];
    }

    public async Task ReplaceAsync(AppUser user, List<UserNotificationPreferenceDto> preferences, CancellationToken cancellationToken)
    {
        var requestedPreferences = preferences
            .Where(preference => preference.Channel == NotificationChannel.Email && AllEmailTypes().Contains(preference.Type))
            .GroupBy(preference => new { preference.Type, preference.Channel })
            .Select(group => group.Last())
            .ToList();

        var existingPreferences = await _db.UserNotificationPreferences
            .Where(preference => preference.UserId == user.Id)
            .ToListAsync(cancellationToken);

        foreach (var requestedPreference in requestedPreferences)
        {
            var existingPreference = existingPreferences.FirstOrDefault(preference =>
                preference.Type == requestedPreference.Type && preference.Channel == requestedPreference.Channel);
            if (existingPreference is null)
            {
                await _db.UserNotificationPreferences.AddAsync(new UserNotificationPreference
                {
                    UserId = user.Id,
                    User = user,
                    Type = requestedPreference.Type,
                    Channel = requestedPreference.Channel,
                    IsEnabled = requestedPreference.IsEnabled
                }, cancellationToken);
                continue;
            }

            existingPreference.IsEnabled = requestedPreference.IsEnabled;
        }
    }

    public async Task<bool> IsEnabledAsync(string? userId, NotificationType type, NotificationChannel channel, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return true;
        }

        var preference = await _db.UserNotificationPreferences
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Type == type && p.Channel == channel, cancellationToken);
        return preference?.IsEnabled ?? true;
    }

    private static NotificationType[] AllEmailTypes()
    {
        return
        [
            NotificationType.ApprovalRequestTaskCreated,
            NotificationType.ApprovalRequestCancelled,
            NotificationType.ApprovalRequestReviewed
        ];
    }
}
