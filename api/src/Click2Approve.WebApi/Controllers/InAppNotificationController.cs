using Asp.Versioning;
using Click2Approve.Application.Abstractions.Services.Notifications;
using Click2Approve.Application.Abstractions.TenantContext;
using Click2Approve.Domain.Models;
using Click2Approve.Domain.Validation;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Mappers.Grids;
using Click2Approve.WebApi.Mappers.Notifications;
using Click2Approve.WebApi.Models.Responses.Grids;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that expose in-app notifications.
/// </summary>
[Tags("Click2Approve.WebApi.InAppNotification")]
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/tenants/{tenantGlobalId:guid}/notifications")]
[Authorize]
public class InAppNotificationController(
    INotificationService notificationService,
    ITenantContext tenantContext,
    UserManager<AppUser> userManager) : ControllerBase
{
    /// <summary>
    /// Counts unread in-app notifications.
    /// </summary>
    /// <param name="cancellationToken">Cancels the operation.</param>
    [HttpGet("unread/count")]
    public async Task<ActionResult<long>> CountUnreadInAppAsync(CancellationToken cancellationToken)
    {
        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return Ok(await notificationService.CountInAppUnreadAsync(user, tenantId, cancellationToken));
    }

    /// <summary>
    /// Lists in-app notifications.
    /// </summary>
    /// <param name="query">Pagination, sorting, and filter options.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    [HttpGet]
    public async Task<ActionResult<GridPageResponse<InAppNotificationResponse>>> ListInAppAsync(
        [FromQuery] InAppNotificationListQueryRequest query,
        CancellationToken cancellationToken)
    {
        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        var page = await notificationService.ListInAppAsync(
            user,
            tenantId,
            InAppNotificationListQueryContractMapper.Map(query),
            cancellationToken);
        return Ok(GridPageResponseMapper.Map(page, InAppNotificationResponseMapper.Map));
    }

    /// <summary>
    /// Marks an in-app notification as read.
    /// </summary>
    /// <param name="notificationGlobalId">The notification ID.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    [HttpPost("{notificationGlobalId:guid}/read")]
    public async Task<IActionResult> MarkInAppReadAsync(Guid notificationGlobalId, CancellationToken cancellationToken)
    {
        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        await notificationService.MarkInAppReadAsync(user, tenantId, notificationGlobalId, cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Marks selected in-app notifications as read.
    /// </summary>
    /// <param name="payload">The notification IDs to update.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    [HttpPost("readSelected")]
    public async Task<IActionResult> MarkInAppReadAsync(
        [FromBody] ReadInAppNotificationsRequest payload,
        CancellationToken cancellationToken)
    {
        if (payload.NotificationGlobalIds.Count is < 1 or > CollectionLimits.NotificationActionItems)
        {
            return BadRequest($"Between one and {CollectionLimits.NotificationActionItems} notification deliveries must be selected.");
        }

        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        await notificationService.MarkInAppReadAsync(
            user,
            tenantId,
            payload.NotificationGlobalIds,
            cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Deletes selected in-app notifications.
    /// </summary>
    /// <param name="payload">The notification IDs to delete.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    [HttpDelete]
    public async Task<IActionResult> DeleteInAppAsync(
        [FromBody] DeleteInAppNotificationsRequest payload,
        CancellationToken cancellationToken)
    {
        if (payload.NotificationGlobalIds.Count is < 1 or > CollectionLimits.NotificationActionItems)
        {
            return BadRequest($"Between one and {CollectionLimits.NotificationActionItems} notification deliveries must be selected.");
        }

        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        await notificationService.DeleteInAppAsync(
            user,
            tenantId,
            payload.NotificationGlobalIds,
            cancellationToken);
        return Ok();
    }

}
