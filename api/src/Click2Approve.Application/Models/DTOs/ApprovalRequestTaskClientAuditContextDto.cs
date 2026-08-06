namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents browser-provided audit context captured when an assignee completes a task.
/// </summary>
public class ApprovalRequestTaskClientAuditContextDto
{
    public string? Language { get; set; }

    public string[]? Languages { get; set; }

    public string? TimeZone { get; set; }

    public string? Timestamp { get; set; }

    public int? TimeZoneOffsetMinutes { get; set; }

    public int? ScreenWidth { get; set; }

    public int? ScreenHeight { get; set; }

    public int? ViewportWidth { get; set; }

    public int? ViewportHeight { get; set; }

    public double? DevicePixelRatio { get; set; }

    public int? ColorDepth { get; set; }

    public bool? TouchSupported { get; set; }

    public string? Platform { get; set; }

    public string? UserAgentPlatform { get; set; }

    public bool? UserAgentMobile { get; set; }

    public string? ConnectionEffectiveType { get; set; }

    public double? ConnectionDownlink { get; set; }

    public int? ConnectionRoundTripTime { get; set; }

    public bool? ConnectionSaveData { get; set; }

    public string? Route { get; set; }

    public string? BuildVersion { get; set; }
}
