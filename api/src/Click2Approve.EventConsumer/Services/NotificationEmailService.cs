using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Emails;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.EventConsumer.Services;

/// <summary>Renders notification emails after the handler applies recipient preferences.</summary>
public class NotificationEmailService(
    ApiDbContext db,
    IEmailService emailService,
    IConfiguration configuration,
    IUserFileStorage fileStorage)
{
    private readonly ApiDbContext _db = db;
    private readonly IEmailService _emailService = emailService;
    private readonly IConfiguration _configuration = configuration;
    private readonly IUserFileStorage _fileStorage = fileStorage;

    /// <summary>Composes and sends a notification for its selected recipient.</summary>
    public async Task SendAsync(AppUser recipient, NotificationEventPayload payload, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(recipient.NormalizedEmail)) return;
        var tenantGlobalId = await _db.Tenants.Where(tenant => tenant.Id == payload.TenantId)
            .Select(tenant => (Guid?)tenant.GlobalId).SingleOrDefaultAsync(cancellationToken);
        if (tenantGlobalId is null) return;
        var context = payload.Type == NotificationType.DiscussionMessageCreated
            ? await CreateDiscussionContextAsync(payload, tenantGlobalId.Value, cancellationToken)
            : await CreateContextAsync(payload, tenantGlobalId.Value, cancellationToken);
        if (context is null) return;
        var template = NotificationEmailTemplates.Create(payload.Type, context);
        await _emailService.SendAsync(new EmailMessage
        {
            ToAddress = recipient.NormalizedEmail,
            Subject = template.Subject.ReplaceLineEndings(" "),
            Body = EmailLayout.Render(
                template,
                EmailBranding.GetLogoUrl(_configuration),
                _configuration.GetValue<Uri>("UI:BaseUrl")?.ToString())
        }, cancellationToken);
    }

    /// <summary>Allows the commercial worker to resolve its discussion data without a shared dependency.</summary>
    protected virtual async Task<NotificationEmailContext?> CreateDiscussionContextAsync(
        NotificationEventPayload payload,
        Guid tenantGlobalId,
        CancellationToken cancellationToken)
    {
        // Legacy events do not identify a message: show context only, never guess the latest author or excerpt.
        var task = await _db.ApprovalRequestTasks.AsNoTracking()
            .Include(item => item.ApprovalRequest)
            .FirstOrDefaultAsync(item => item.GlobalId == payload.EntityGlobalId
                && item.AssigneeUserId == payload.UserId && item.TenantId == payload.TenantId, cancellationToken);
        if (task is not null)
        {
            return new NotificationEmailContext
            {
                RequestTitle = task.ApprovalRequest.Title,
                ActionUrl = GetLink(tenantGlobalId, $"tasks/{task.GlobalId}/chat")
            };
        }
        var request = await _db.ApprovalRequests.AsNoTracking().FirstOrDefaultAsync(
            item => item.GlobalId == payload.EntityGlobalId && item.CreatedByUserId == payload.UserId
                && item.TenantId == payload.TenantId, cancellationToken);
        return request is null ? null : new NotificationEmailContext
        {
            RequestTitle = request.Title,
            ActionUrl = GetLink(tenantGlobalId, $"requests/{request.GlobalId}/chat")
        };
    }

    /// <summary>Builds a link using the deployment's existing UI base and application path.</summary>
    protected string GetLink(Guid tenantGlobalId, string route) => UriHelpers.GetUiUri(
        _configuration.GetValue<Uri>("UI:BaseUrl"), _configuration["UI:AppPath"], $"tenants/{tenantGlobalId}/{route}").ToString();

    /// <summary>Uses stored attribution and public images, with a system fallback for missing actors.</summary>
    protected EmailActor CreateActor(string? displayName, AppUser? user, ApprovalRequest request) => new()
    {
        DisplayName = request.Tenant.Type == TenantType.Business && !string.IsNullOrWhiteSpace(displayName)
            ? displayName.Trim()
            : user is null ? null : DisplayNameHelpers.FormatParticipantDisplayName(
                user.FirstName, user.LastName, position: null, email: user.Email ?? user.NormalizedEmail),
        AvatarUrl = PublicImage(user?.AvatarUserFile),
        OrganizationDisplayName = request.Tenant.Type == TenantType.Business ? request.OrganizationDisplayName : null,
        OrganizationLogoUrl = request.Tenant.Type == TenantType.Business ? PublicImage(request.Tenant.LogoUserFile) : null
    };

    private async Task<NotificationEmailContext?> CreateContextAsync(
        NotificationEventPayload payload,
        Guid tenantGlobalId,
        CancellationToken cancellationToken)
    {
        if (payload.Type == NotificationType.ApprovalRequestTaskCreated)
        {
            var task = await GetTasksQuery().FirstOrDefaultAsync(
                item => item.GlobalId == payload.EntityGlobalId && item.AssigneeUserId == payload.UserId
                    && item.TenantId == payload.TenantId, cancellationToken);
            return task is null ? null : new NotificationEmailContext
            {
                RequestTitle = task.ApprovalRequest.Title,
                ActionUrl = GetLink(tenantGlobalId, $"tasks/{task.GlobalId}"),
                Action = task.Action,
                Actor = CreateActor(task.ApprovalRequest.CreatedByDisplayName, task.ApprovalRequest.CreatedByUser, task.ApprovalRequest)
            };
        }

        var request = await _db.ApprovalRequests.AsNoTracking()
            .Include(item => item.Tenant).ThenInclude(tenant => tenant.LogoUserFile)
            .Include(item => item.CompletedByUser).ThenInclude(user => user!.AvatarUserFile)
            .FirstOrDefaultAsync(item => item.GlobalId == payload.EntityGlobalId, cancellationToken);
        if (request is null) return null;
        string route;
        if (payload.Type != NotificationType.ApprovalRequestTaskCompleted
            && request.CreatedByUserId == payload.UserId && request.TenantId == payload.TenantId)
        {
            route = $"requests/{request.GlobalId}";
        }
        else
        {
            var tasks = _db.ApprovalRequestTasks.Where(task => task.ApprovalRequestId == request.Id
                && task.AssigneeUserId == payload.UserId && task.TenantId == payload.TenantId);
            if (payload.Type == NotificationType.ApprovalRequestTaskCompleted && payload.SourceGlobalId is { } sourceId)
            {
                tasks = tasks.Where(task => task.GlobalId == sourceId);
            }
            var taskGlobalId = await tasks.OrderByDescending(task => task.CompletedAt).ThenByDescending(task => task.Id)
                .Select(task => (Guid?)task.GlobalId).FirstOrDefaultAsync(cancellationToken);
            if (taskGlobalId is null) return null;
            route = $"tasks/{taskGlobalId}";
        }
        var context = new NotificationEmailContext
        {
            RequestTitle = request.Title,
            ActionUrl = GetLink(tenantGlobalId, route),
            Status = request.Status,
            Result = request.Result,
            Actor = request.CompletedByUserId is null ? new EmailActor { IsSystemGenerated = true }
                : CreateActor(request.CompletedByDisplayName, request.CompletedByUser, request)
        };
        if (payload.Type == NotificationType.ApprovalRequestTaskCompleted)
        {
            return context with
            {
                Reason = request.Result == false
                    ? "This happened because the request was declined."
                    : "This happened because the request no longer requires your action."
            };
        }
        if (payload.Type == NotificationType.ApprovalRequestStepCompleted)
        {
            var task = payload.SourceGlobalId is null ? null : await GetTasksQuery().FirstOrDefaultAsync(
                item => item.GlobalId == payload.SourceGlobalId && item.ApprovalRequestId == request.Id,
                cancellationToken);
            return context with
            {
                Action = task?.Action,
                Result = task?.Result,
                Actor = task is null ? CreateActor(displayName: null, user: null, request)
                    : CreateActor(task.CompletedByDisplayName, task.CompletedByUser, task.ApprovalRequest)
            };
        }
        return context;
    }

    private IQueryable<ApprovalRequestTask> GetTasksQuery() => _db.ApprovalRequestTasks.AsNoTracking()
        .Include(item => item.CompletedByUser).ThenInclude(user => user!.AvatarUserFile)
        .Include(item => item.ApprovalRequest).ThenInclude(request => request.CreatedByUser).ThenInclude(user => user.AvatarUserFile)
        .Include(item => item.ApprovalRequest).ThenInclude(request => request.Tenant).ThenInclude(tenant => tenant.LogoUserFile);

    private string? PublicImage(UserFile? file) => file is { StorageType: UserFileStorageType.Public }
        ? _fileStorage.GetPublicUrl(file) : null;
}
