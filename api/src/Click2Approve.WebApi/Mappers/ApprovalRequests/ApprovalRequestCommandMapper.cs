namespace Click2Approve.WebApi.Mappers.ApprovalRequests;

/// <summary>
/// Maps approval-request HTTP requests to application commands.
/// </summary>
public static class ApprovalRequestCommandMapper
{
    public static SubmitApprovalRequestCommand Map(SubmitApprovalRequestRequest request) => new()
    {
        Description = request.Description,
        PreviousRevisionApprovalRequestGlobalId = request.PreviousRevisionApprovalRequestGlobalId,
        RequestFiles = [.. request.RequestFiles.Select(Map)],
        StepVisibility = [.. request.StepVisibility.Select(Map)],
        Steps = [.. request.Steps.Select(Map)],
        Title = request.Title
    };

    public static ResubmitApprovalRequestCommand Map(ResubmitApprovalRequestRequest request) => new()
    {
        Description = request.Description,
        RequestFiles = [.. request.RequestFiles.Select(Map)],
        StepVisibility = [.. request.StepVisibility.Select(Map)],
        Steps = [.. request.Steps.Select(Map)]
    };

    public static CompleteApprovalRequestTaskCommand Map(CompleteApprovalRequestTaskRequest request) => new()
    {
        AssigneeBrowserData = request.AssigneeBrowserData,
        AssigneeIpAddress = request.AssigneeIpAddress,
        AssigneeLegalName = request.AssigneeLegalName,
        AssigneeOrganization = request.AssigneeOrganization,
        AssigneeSignatureJson = request.AssigneeSignatureJson,
        ClientAuditContext = request.ClientAuditContext is null ? null : Map(request.ClientAuditContext),
        Comment = request.Comment,
        GlobalId = request.GlobalId,
        Result = request.Result
    };

    public static ApprovalRequestStepCommand Map(ApprovalRequestStepRequest request) => new()
    {
        Action = request.Action,
        Assignees = [.. request.Assignees.Select(Map)],
        Mode = request.Mode,
        Sequence = request.Sequence,
        VisibilityMode = request.VisibilityMode
    };

    public static ApprovalRequestStepVisibilityCommand Map(ApprovalRequestStepVisibilityRequest request) => new()
    {
        AssigneeIndex = request.AssigneeIndex,
        AssigneeStepSequence = request.AssigneeStepSequence,
        IsVisible = request.IsVisible,
        StepSequence = request.StepSequence
    };

    private static ApprovalRequestAssigneeCommand Map(ApprovalRequestAssigneeRequest request) => new()
    {
        Email = request.Email,
        EmployeeGlobalId = request.EmployeeGlobalId,
        TeamGlobalId = request.TeamGlobalId,
        Type = request.Type,
        UserGlobalId = request.UserGlobalId
    };

    private static ApprovalRequestFileCommand Map(ApprovalRequestFileRequest request) => new()
    {
        PreviousApprovalRequestFileGlobalId = request.PreviousApprovalRequestFileGlobalId,
        RevisionAction = request.RevisionAction,
        Sequence = request.Sequence,
        UserFileGlobalId = request.UserFileGlobalId
    };

    private static ApprovalRequestTaskClientAuditContext Map(ApprovalRequestTaskClientAuditContextRequest request) => new()
    {
        BuildVersion = request.BuildVersion,
        ColorDepth = request.ColorDepth,
        ConnectionDownlink = request.ConnectionDownlink,
        ConnectionEffectiveType = request.ConnectionEffectiveType,
        ConnectionRoundTripTime = request.ConnectionRoundTripTime,
        ConnectionSaveData = request.ConnectionSaveData,
        DevicePixelRatio = request.DevicePixelRatio,
        Language = request.Language,
        Languages = request.Languages,
        Platform = request.Platform,
        Route = request.Route,
        ScreenHeight = request.ScreenHeight,
        ScreenWidth = request.ScreenWidth,
        Timestamp = request.Timestamp,
        TimeZone = request.TimeZone,
        TimeZoneOffsetMinutes = request.TimeZoneOffsetMinutes,
        TouchSupported = request.TouchSupported,
        UserAgentMobile = request.UserAgentMobile,
        UserAgentPlatform = request.UserAgentPlatform,
        ViewportHeight = request.ViewportHeight,
        ViewportWidth = request.ViewportWidth
    };
}
