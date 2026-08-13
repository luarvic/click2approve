using Asp.Versioning;
using Click2Approve.Application.Abstractions.Services.Notifications;
using Click2Approve.Application.Abstractions.TenantContext;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Mappers;
using Click2Approve.WebApi.Mappers.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that expose in-app domain event deliveries.
/// </summary>
[Tags("Click2Approve.WebApi.InAppNotification")]
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/tenants/{tenantGlobalId:guid}/notifications")]
[Authorize]
public class InAppNotificationController(
    IDomainEventService domainEventService,
    ITenantContext tenantContext,
    UserManager<AppUser> userManager) : ControllerBase
{
    [HttpGet("unread/count")]
    public async Task<ActionResult<long>> CountUnreadInAppAsync(CancellationToken cancellationToken)
    {
        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return Ok(await domainEventService.CountInAppUnreadAsync(user, tenantId, cancellationToken));
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
        return Ok(InAppNotificationResponseMapper.Map(await domainEventService.ListInAppAsync(
            user,
            tenantId,
            unreadOnly,
            Math.Max(skip, 0),
            Math.Clamp(take, 1, 100),
            cancellationToken)));
    }

    [HttpPost("{deliveryGlobalId:guid}/read")]
    public async Task<IActionResult> MarkInAppReadAsync(Guid deliveryGlobalId, CancellationToken cancellationToken)
    {
        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        await domainEventService.MarkInAppReadAsync(user, tenantId, deliveryGlobalId, cancellationToken);
        return Ok();
    }

    [HttpPost("readSelected")]
    public async Task<IActionResult> MarkInAppReadAsync(
        [FromBody] ReadInAppNotificationsRequest payload,
        CancellationToken cancellationToken)
    {
        if (payload.DeliveryGlobalIds.Count is < 1 or > 100)
        {
            return BadRequest("Between one and 100 notification deliveries must be selected.");
        }

        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        await domainEventService.MarkInAppReadAsync(
            user,
            tenantId,
            payload.DeliveryGlobalIds,
            cancellationToken);
        return Ok();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteInAppAsync(
        [FromBody] DeleteInAppNotificationsRequest payload,
        CancellationToken cancellationToken)
    {
        if (payload.DeliveryGlobalIds.Count is < 1 or > 100)
        {
            return BadRequest("Between one and 100 notification deliveries must be selected.");
        }

        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        await domainEventService.DeleteInAppAsync(
            user,
            tenantId,
            payload.DeliveryGlobalIds,
            cancellationToken);
        return Ok();
    }

    [HttpPost("read")]
    public async Task<IActionResult> MarkAllInAppReadAsync(CancellationToken cancellationToken)
    {
        var user = await userManager.GetAppUserAsync(User);
        var tenantId = await tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        await domainEventService.MarkAllInAppReadAsync(user, tenantId, cancellationToken);
        return Ok();
    }
}
