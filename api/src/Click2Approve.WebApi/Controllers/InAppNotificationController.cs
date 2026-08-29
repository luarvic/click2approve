using Asp.Versioning;
using Click2Approve.Application.Abstractions.Services.Notifications;
using Click2Approve.Application.Abstractions.TenantContext;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Mappers.Notifications;
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
    [HttpGet("unread/count")]
    public async Task<ActionResult<long>> CountUnreadInAppAsync(CancellationToken cancellationToken)
    {
        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return Ok(await notificationService.CountInAppUnreadAsync(user, tenantId, cancellationToken));
    }

    [HttpGet]
    public async Task<ActionResult<List<InAppNotificationResponse>>> ListInAppAsync(
        [FromQuery] bool unreadOnly = true,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return Ok(InAppNotificationResponseMapper.Map(await notificationService.ListInAppAsync(
            user,
            tenantId,
            unreadOnly,
            Math.Max(skip, 0),
            Math.Clamp(take, 1, 100),
            cancellationToken)));
    }

    [HttpPost("{notificationGlobalId:guid}/read")]
    public async Task<IActionResult> MarkInAppReadAsync(Guid notificationGlobalId, CancellationToken cancellationToken)
    {
        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        await notificationService.MarkInAppReadAsync(user, tenantId, notificationGlobalId, cancellationToken);
        return Ok();
    }

    [HttpPost("readSelected")]
    public async Task<IActionResult> MarkInAppReadAsync(
        [FromBody] ReadInAppNotificationsRequest payload,
        CancellationToken cancellationToken)
    {
        if (payload.NotificationGlobalIds.Count is < 1 or > 100)
        {
            return BadRequest("Between one and 100 notification deliveries must be selected.");
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

    [HttpDelete]
    public async Task<IActionResult> DeleteInAppAsync(
        [FromBody] DeleteInAppNotificationsRequest payload,
        CancellationToken cancellationToken)
    {
        if (payload.NotificationGlobalIds.Count is < 1 or > 100)
        {
            return BadRequest("Between one and 100 notification deliveries must be selected.");
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

    [HttpPost("read")]
    public async Task<IActionResult> MarkAllInAppReadAsync(CancellationToken cancellationToken)
    {
        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        await notificationService.MarkAllInAppReadAsync(user, tenantId, cancellationToken);
        return Ok();
    }
}
