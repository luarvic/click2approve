namespace Click2Approve.WebApi.Models.Requests.ApprovalRequests;

/// <summary>
/// Represents browser-provided audit context captured when an assignee completes a task.
/// </summary>
public class ApprovalRequestTaskClientAuditContextRequest
{
    /// <summary>Primary language reported by the client.</summary>
    public string? Language { get; set; }

    /// <summary>Preferred languages reported by the client.</summary>
    public string[]? Languages { get; set; }

    /// <summary>Time zone reported by the client.</summary>
    public string? TimeZone { get; set; }

    /// <summary>Timestamp reported by the client.</summary>
    public string? Timestamp { get; set; }

    /// <summary>Client offset from UTC in minutes.</summary>
    public int? TimeZoneOffsetMinutes { get; set; }

    /// <summary>Client screen width in pixels.</summary>
    public int? ScreenWidth { get; set; }

    /// <summary>Client screen height in pixels.</summary>
    public int? ScreenHeight { get; set; }

    /// <summary>Client viewport width in pixels.</summary>
    public int? ViewportWidth { get; set; }

    /// <summary>Client viewport height in pixels.</summary>
    public int? ViewportHeight { get; set; }

    /// <summary>Pixel ratio reported by the client device.</summary>
    public double? DevicePixelRatio { get; set; }

    /// <summary>Client screen color depth in bits.</summary>
    public int? ColorDepth { get; set; }

    /// <summary>Whether the client reports touch input support.</summary>
    public bool? TouchSupported { get; set; }

    /// <summary>Platform reported by the client browser.</summary>
    public string? Platform { get; set; }

    /// <summary>Platform from client user-agent hints.</summary>
    public string? UserAgentPlatform { get; set; }

    /// <summary>Whether client user-agent hints indicate a mobile device.</summary>
    public bool? UserAgentMobile { get; set; }

    /// <summary>Effective connection type reported by the client.</summary>
    public string? ConnectionEffectiveType { get; set; }

    /// <summary>Estimated client network downlink speed in megabits per second.</summary>
    public double? ConnectionDownlink { get; set; }

    /// <summary>Estimated client network round trip time in milliseconds.</summary>
    public int? ConnectionRoundTripTime { get; set; }

    /// <summary>Whether the client requested reduced data usage.</summary>
    public bool? ConnectionSaveData { get; set; }

    /// <summary>Client route where the action occurred.</summary>
    public string? Route { get; set; }

    /// <summary>Client application build version.</summary>
    public string? BuildVersion { get; set; }
}
