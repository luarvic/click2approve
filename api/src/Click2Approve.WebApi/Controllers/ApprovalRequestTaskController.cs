using System.Text.Json;
using System.Text.Json.Serialization;
using Asp.Versioning;
using Click2Approve.Application.Abstractions.Services.ApprovalRequests;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Mappers.ApprovalRequests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that manage approval request tasks.
/// </summary>
/// <param name="logger">The logger service.</param>
/// <param name="approvalRequestTaskService">The service that manages approval request tasks.</param>
/// <param name="userManager">The service that manages users.</param>
[Tags("Click2Approve.WebApi.ApprovalRequestTask")]
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/tenants/{tenantGlobalId:guid}/tasks")]
[Authorize]
public class ApprovalRequestTaskController(
    ILogger<ApprovalRequestTaskController> logger,
    IApprovalRequestTaskService approvalRequestTaskService,
    UserManager<AppUser> userManager) : ControllerBase
{
    private const int MaxBrowserDataLength = 1024;
    private const int MaxHeaderLength = 256;
    private const int MaxLanguageCount = 5;
    private const int MaxRouteLength = 192;
    private const int MaxShortValueLength = 64;
    private const int MaxTimestampLength = 40;

    private static readonly JsonSerializerOptions BrowserDataJsonOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly ILogger<ApprovalRequestTaskController> _logger = logger;
    private readonly IApprovalRequestTaskService _approvalRequestTaskService = approvalRequestTaskService;
    private readonly UserManager<AppUser> _userManager = userManager;

    /// <summary>
    /// Complete an approval request task.
    /// </summary>
    /// <param name="payload">The payload that contains the approval request task properties.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    [HttpPost("complete")]
    public async Task<IActionResult> CompleteAsync([FromBody] CompleteApprovalRequestTaskRequest payload, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        payload.AssigneeIpAddress = GetClientIpAddress();
        payload.AssigneeBrowserData = BuildBrowserData(payload.ClientAuditContext);
        await _approvalRequestTaskService.CompleteAsync(user, ApprovalRequestCommandMapper.Map(payload), cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Lists incoming approval request task summaries.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of approval request task summaries.</returns>
    [HttpGet]
    public async Task<ActionResult<List<ApprovalRequestTaskListItemResponse>>> ListAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        var tasks = await _approvalRequestTaskService.ListAsync(user, cancellationToken);
        return Ok(ApprovalRequestResponseMapper.Map(tasks));
    }

    /// <summary>
    /// Gets an approval request task with the request data the assignee can view.
    /// </summary>
    [HttpGet("{globalId:guid}")]
    public async Task<ActionResult<ApprovalRequestTaskDetailsResponse>> GetAsync(Guid globalId, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(ApprovalRequestResponseMapper.Map(await _approvalRequestTaskService.GetAsync(user, globalId, cancellationToken)));
    }

    /// <summary>
    /// Gets number of uncompleted approval request tasks.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The number of the approval requests.</returns>
    [HttpGet("uncompleted/count")]
    public async Task<ActionResult<long>> CountUncompletedAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        var count = await _approvalRequestTaskService.CountUncompletedAsync(user, cancellationToken);
        return Ok(count);
    }

    private string? GetClientIpAddress()
    {
        var forwardedFor = Request.Headers["X-Forwarded-For"].ToString();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    private string BuildBrowserData(ApprovalRequestTaskClientAuditContextRequest? clientAuditContext)
    {
        var browserData = new ApprovalRequestTaskBrowserData(
            TrimToNull(Request.Headers.UserAgent.ToString(), MaxHeaderLength),
            TrimToNull(Request.Headers.AcceptLanguage.ToString(), MaxHeaderLength),
            TrimToNull(Request.Headers.Origin.ToString(), MaxHeaderLength),
            TrimToNull(Request.Headers.Referer.ToString(), MaxHeaderLength),
            Sanitize(clientAuditContext));

        var serialized = JsonSerializer.Serialize(browserData, BrowserDataJsonOptions);
        if (serialized.Length <= MaxBrowserDataLength)
        {
            return serialized;
        }

        browserData = browserData with
        {
            ServerOrigin = null,
            ServerReferer = null,
            Client = Sanitize(clientAuditContext, includeOptionalNetworkData: false)
        };
        serialized = JsonSerializer.Serialize(browserData, BrowserDataJsonOptions);
        if (serialized.Length <= MaxBrowserDataLength)
        {
            return serialized;
        }

        browserData = browserData with { Client = null };
        return JsonSerializer.Serialize(browserData, BrowserDataJsonOptions);
    }

    private static ApprovalRequestTaskClientAuditContextRequest? Sanitize(
        ApprovalRequestTaskClientAuditContextRequest? clientAuditContext,
        bool includeOptionalNetworkData = true)
    {
        if (clientAuditContext is null)
        {
            return null;
        }

        return new ApprovalRequestTaskClientAuditContextRequest
        {
            Language = TrimToNull(clientAuditContext.Language, MaxShortValueLength),
            Languages = clientAuditContext.Languages?
                .Select(language => TrimToNull(language, MaxShortValueLength))
                .Where(language => language is not null)
                .Take(MaxLanguageCount)
                .Select(language => language!)
                .ToArray(),
            TimeZone = TrimToNull(clientAuditContext.TimeZone, MaxShortValueLength),
            Timestamp = TrimToNull(clientAuditContext.Timestamp, MaxTimestampLength),
            TimeZoneOffsetMinutes = clientAuditContext.TimeZoneOffsetMinutes,
            ScreenWidth = clientAuditContext.ScreenWidth,
            ScreenHeight = clientAuditContext.ScreenHeight,
            ViewportWidth = clientAuditContext.ViewportWidth,
            ViewportHeight = clientAuditContext.ViewportHeight,
            DevicePixelRatio = clientAuditContext.DevicePixelRatio,
            ColorDepth = clientAuditContext.ColorDepth,
            TouchSupported = clientAuditContext.TouchSupported,
            Platform = TrimToNull(clientAuditContext.Platform, MaxShortValueLength),
            UserAgentPlatform = TrimToNull(clientAuditContext.UserAgentPlatform, MaxShortValueLength),
            UserAgentMobile = clientAuditContext.UserAgentMobile,
            ConnectionEffectiveType = includeOptionalNetworkData
                ? TrimToNull(clientAuditContext.ConnectionEffectiveType, MaxShortValueLength)
                : null,
            ConnectionDownlink = includeOptionalNetworkData ? clientAuditContext.ConnectionDownlink : null,
            ConnectionRoundTripTime = includeOptionalNetworkData ? clientAuditContext.ConnectionRoundTripTime : null,
            ConnectionSaveData = includeOptionalNetworkData ? clientAuditContext.ConnectionSaveData : null,
            Route = TrimToNull(clientAuditContext.Route, MaxRouteLength),
            BuildVersion = TrimToNull(clientAuditContext.BuildVersion, MaxShortValueLength)
        };
    }

    private static string? TrimToNull(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        value = value.Trim();
        return value.Length <= maxLength ? value : value[..maxLength];
    }

    /// <summary>
    /// Contains browser metadata submitted with an approval request task action.
    /// </summary>
    private sealed record ApprovalRequestTaskBrowserData(
        string? ServerUserAgent,
        string? ServerAcceptLanguage,
        string? ServerOrigin,
        string? ServerReferer,
        ApprovalRequestTaskClientAuditContextRequest? Client);
}
