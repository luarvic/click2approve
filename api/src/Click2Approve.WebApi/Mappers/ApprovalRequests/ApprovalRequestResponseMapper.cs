using Click2Approve.Application.Models.Results.ApprovalRequests;
using Click2Approve.WebApi.Mappers.UserFiles;

namespace Click2Approve.WebApi.Mappers.ApprovalRequests;

/// <summary>
/// Maps approval-request application results to HTTP responses.
/// </summary>
internal static class ApprovalRequestResponseMapper
{
    public static List<ApprovalRequestListItemResponse> Map(IEnumerable<ApprovalRequestListItemResult> results) => [.. results.Select(Map)];

    public static ApprovalRequestListItemResponse Map(ApprovalRequestListItemResult result) => new()
    {
        CreatedAt = result.CreatedAt,
        CreatedByDisplayName = result.CreatedByDisplayName,
        GlobalId = result.GlobalId,
        Result = result.Result,
        RevisionNumber = result.RevisionNumber,
        Status = result.Status,
        Title = result.Title
    };

    public static ApprovalRequestDetailsResponse Map(ApprovalRequestDetailsResult result) => new()
    {
        CompletedAt = result.CompletedAt,
        CompletedByDisplayName = result.CompletedByDisplayName,
        CompletedByEmail = result.CompletedByEmail,
        CompletedByEmployeeGlobalId = result.CompletedByEmployeeGlobalId,
        CompletedByUserGlobalId = result.CompletedByUserGlobalId,
        CreatedAt = result.CreatedAt,
        CreatedByDisplayName = result.CreatedByDisplayName,
        CreatedByEmail = result.CreatedByEmail,
        CreatedByEmployeeGlobalId = result.CreatedByEmployeeGlobalId,
        CreatedByUserGlobalId = result.CreatedByUserGlobalId,
        Description = result.Description,
        GlobalId = result.GlobalId,
        NextRevisionApprovalRequestGlobalId = result.NextRevisionApprovalRequestGlobalId,
        NextRevisionApprovalRequestTitle = result.NextRevisionApprovalRequestTitle,
        OrganizationDisplayName = result.OrganizationDisplayName,
        PreviousRevisionApprovalRequestGlobalId = result.PreviousRevisionApprovalRequestGlobalId,
        PreviousRevisionApprovalRequestTitle = result.PreviousRevisionApprovalRequestTitle,
        RequestFiles = [.. result.RequestFiles.Select(Map)],
        Result = result.Result,
        RevisionNumber = result.RevisionNumber,
        Status = result.Status,
        Steps = [.. result.Steps.Select(Map)],
        Title = result.Title
    };

    public static List<ApprovalRequestTaskListItemResponse> Map(IEnumerable<ApprovalRequestTaskListItemResult> results) => [.. results.Select(Map)];

    public static ApprovalRequestTaskListItemResponse Map(ApprovalRequestTaskListItemResult result) => new()
    {
        Action = result.Action,
        CreatedAt = result.CreatedAt,
        GlobalId = result.GlobalId,
        OrganizationDisplayName = result.OrganizationDisplayName,
        RequestedByDisplayName = result.RequestedByDisplayName,
        Result = result.Result,
        RevisionNumber = result.RevisionNumber,
        Status = result.Status,
        Title = result.Title
    };

    public static ApprovalRequestTaskDetailsResponse Map(ApprovalRequestTaskDetailsResult result)
    {
        var response = MapTask(result);
        return new ApprovalRequestTaskDetailsResponse(response)
        {
            ApprovalRequest = result.ApprovalRequest is null ? null : Map(result.ApprovalRequest),
            RequestFiles = [.. result.RequestFiles.Select(Map)]
        };
    }

    private static ApprovalRequestFileResponse Map(ApprovalRequestFileResult result) => new()
    {
        GlobalId = result.GlobalId,
        PreviousApprovalRequestFileGlobalId = result.PreviousApprovalRequestFileGlobalId,
        PreviousUserFile = result.PreviousUserFile is null ? null : UserFileResponseMapper.Map(result.PreviousUserFile),
        RevisionAction = result.RevisionAction,
        Sequence = result.Sequence,
        UserFile = UserFileResponseMapper.Map(result.UserFile)
    };

    private static ApprovalRequestStepResponse Map(ApprovalRequestStepResult result) => new()
    {
        Action = result.Action,
        Instructions = result.Instructions,
        IsAttachmentRequired = result.IsAttachmentRequired,
        IsCommentRequired = result.IsCommentRequired,
        IsElectronicSignatureRequired = result.IsElectronicSignatureRequired,
        Assignees = [.. result.Assignees.Select(Map)],
        GlobalId = result.GlobalId,
        IsVisible = result.IsVisible,
        Mode = result.Mode,
        Sequence = result.Sequence,
        Tasks = [.. result.Tasks.Select(MapTask)],
        VisibilityMode = result.VisibilityMode
    };

    private static ApprovalRequestAssigneeResponse Map(ApprovalRequestAssigneeResult result) => new()
    {
        DisplayName = result.DisplayName,
        Email = result.Email,
        EmployeeGlobalId = result.EmployeeGlobalId,
        GlobalId = result.GlobalId,
        TeamGlobalId = result.TeamGlobalId,
        Type = result.Type
    };

    private static ApprovalRequestTaskResponse MapTask(ApprovalRequestTaskResult result) => new()
    {
        Action = result.Action,
        ApprovalRequestGlobalId = result.ApprovalRequestGlobalId,
        ApprovalRequestStepAssigneeGlobalId = result.ApprovalRequestStepAssigneeGlobalId,
        ApprovalRequestStepGlobalId = result.ApprovalRequestStepGlobalId,
        AssigneeBrowserData = result.AssigneeBrowserData,
        AssigneeDisplayName = result.AssigneeDisplayName,
        AssigneeEmail = result.AssigneeEmail,
        AssigneeIpAddress = result.AssigneeIpAddress,
        AssigneeLegalName = result.AssigneeLegalName,
        AssigneeRepresentationDetails = result.AssigneeRepresentationDetails,
        AssigneeSignatureJson = result.AssigneeSignatureJson,
        Comment = result.Comment,
        CompletedAt = result.CompletedAt,
        CompletedByDisplayName = result.CompletedByDisplayName,
        CompletedByEmail = result.CompletedByEmail,
        CreatedAt = result.CreatedAt,
        Description = result.Description,
        Instructions = result.Instructions,
        IsAttachmentRequired = result.IsAttachmentRequired,
        IsCommentRequired = result.IsCommentRequired,
        IsElectronicSignatureRequired = result.IsElectronicSignatureRequired,
        GlobalId = result.GlobalId,
        HasAssigneeSignature = result.HasAssigneeSignature,
        IsAssigneeEmployee = result.IsAssigneeEmployee,
        OrganizationDisplayName = result.OrganizationDisplayName,
        RequestedByDisplayName = result.RequestedByDisplayName,
        RequestedByEmail = result.RequestedByEmail,
        Result = result.Result,
        RevisionNumber = result.RevisionNumber,
        Status = result.Status,
        TaskFiles = UserFileResponseMapper.Map(result.TaskFiles),
        Title = result.Title
    };
}
