using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Maps approval request domain models to approval request DTOs.
/// </summary>
internal static class ApprovalRequestMapper
{
    public static ApprovalRequestListItemDto MapApprovalRequestListItem(ApprovalRequest approvalRequest) => new()
    {
        GlobalId = approvalRequest.GlobalId,
        Title = approvalRequest.Title,
        Status = approvalRequest.Status,
        Result = approvalRequest.Result,
        CreatedAt = approvalRequest.CreatedAt,
        CompletedAt = approvalRequest.CompletedAt,
        CreatedByEmail = GetEmail(approvalRequest.CreatedByUser),
        CreatedByDisplayName = approvalRequest.CreatedByDisplayName,
        CreatedByOrganizationDisplayName = approvalRequest.CreatedByOrganizationDisplayName,
        RevisionNumber = approvalRequest.RevisionNumber
    };

    public static ApprovalRequestTaskListItemDto MapTaskListItem(ApprovalRequestTask task) => new()
    {
        GlobalId = task.GlobalId,
        Title = task.Title,
        Action = task.Action,
        Status = task.Status,
        Result = task.Result,
        CreatedAt = task.CreatedAt,
        CompletedAt = task.CompletedAt,
        RequestedByEmail = GetEmail(task.ApprovalRequest.CreatedByUser),
        RequestedByDisplayName = task.ApprovalRequest.CreatedByDisplayName,
        CreatedByOrganizationDisplayName = task.ApprovalRequest.CreatedByOrganizationDisplayName,
        RevisionNumber = GetTaskRevisionNumber(task)
    };

    public static ApprovalRequestDto MapApprovalRequest(
        ApprovalRequest approvalRequest,
        ApprovalRequestApproverGlobalIdMaps approverGlobalIdMaps)
    {
        var approverGlobalIdsById = approvalRequest.Steps
            .SelectMany(step => step.Approvers)
            .ToDictionary(approver => approver.Id, approver => approver.GlobalId);
        var createdByEmail = GetEmail(approvalRequest.CreatedByUser);
        return new ApprovalRequestDto
        {
            GlobalId = approvalRequest.GlobalId,
            Title = approvalRequest.Title,
            RequestFiles = [.. OrderRequestFiles(approvalRequest).Select(MapRequestFile)],
            Steps = [.. approvalRequest.Steps.Select(step => MapStep(
                step,
                approvalRequest.GlobalId,
                approvalRequest.CreatedByDisplayName,
                createdByEmail,
                approvalRequest.CreatedByOrganizationDisplayName,
                approverGlobalIdsById,
                approverGlobalIdMaps))],
            Description = approvalRequest.Description,
            CreatedAt = approvalRequest.CreatedAt,
            CompletedAt = approvalRequest.CompletedAt,
            CreatedByUserId = approvalRequest.CreatedByUserId,
            CreatedByEmail = createdByEmail,
            CreatedByDisplayName = approvalRequest.CreatedByDisplayName,
            CreatedByOrganizationDisplayName = approvalRequest.CreatedByOrganizationDisplayName,
            Status = approvalRequest.Status,
            Result = approvalRequest.Result,
            RevisionNumber = approvalRequest.RevisionNumber,
            PreviousRevisionApprovalRequestGlobalId = approvalRequest.PreviousRevisionApprovalRequest?.GlobalId,
            PreviousRevisionApprovalRequestTitle = approvalRequest.PreviousRevisionApprovalRequest?.Title,
            NextRevisionApprovalRequestGlobalId = approvalRequest.NextRevisionApprovalRequest?.GlobalId,
            NextRevisionApprovalRequestTitle = approvalRequest.NextRevisionApprovalRequest?.Title
        };
    }

    public static ApprovalRequestTaskDetailDto MapTaskDetail(
        ApprovalRequestTask task,
        ApprovalRequest? approvalRequest,
        ApprovalRequestApproverGlobalIdMaps approverGlobalIdMaps) => new(MapTask(task))
        {
            RequestFiles = [.. OrderRequestFiles(task.ApprovalRequest).Select(MapRequestFile)],
            ApprovalRequest = approvalRequest is not null
            ? MapApprovalRequestForTask(approvalRequest, task.ApprovalRequestStepApproverId, approverGlobalIdMaps)
            : null,
            ApproverSignatureJson = task.ApproverSignatureJson
        };

    private static ApprovalRequestDto MapApprovalRequestForTask(
        ApprovalRequest approvalRequest,
        long? approvalRequestStepApproverId,
        ApprovalRequestApproverGlobalIdMaps approverGlobalIdMaps)
    {
        var visibleSteps = approvalRequest.Steps
            .Where(step => StepIsVisibleToApprover(step, approvalRequestStepApproverId))
            .ToList();
        var approverGlobalIdsById = approvalRequest.Steps
            .SelectMany(step => step.Approvers)
            .ToDictionary(approver => approver.Id, approver => approver.GlobalId);

        var createdByEmail = GetEmail(approvalRequest.CreatedByUser);
        return new ApprovalRequestDto
        {
            GlobalId = approvalRequest.GlobalId,
            Title = approvalRequest.Title,
            RequestFiles = [.. OrderRequestFiles(approvalRequest).Select(MapRequestFile)],
            Steps = [.. approvalRequest.Steps.Select(step => MapStepForTask(
                step,
                approvalRequest.GlobalId,
                approvalRequest.CreatedByDisplayName,
                createdByEmail,
                approvalRequest.CreatedByOrganizationDisplayName,
                approvalRequestStepApproverId,
                approverGlobalIdsById,
                approverGlobalIdMaps))],
            Description = approvalRequest.Description,
            CreatedAt = approvalRequest.CreatedAt,
            CompletedAt = approvalRequest.CompletedAt,
            CreatedByUserId = approvalRequest.CreatedByUserId,
            CreatedByEmail = createdByEmail,
            CreatedByDisplayName = approvalRequest.CreatedByDisplayName,
            CreatedByOrganizationDisplayName = approvalRequest.CreatedByOrganizationDisplayName,
            Status = approvalRequest.Status,
            Result = approvalRequest.Result,
            RevisionNumber = approvalRequest.RevisionNumber,
            PreviousRevisionApprovalRequestGlobalId = approvalRequest.PreviousRevisionApprovalRequest?.GlobalId,
            PreviousRevisionApprovalRequestTitle = approvalRequest.PreviousRevisionApprovalRequest?.Title,
            NextRevisionApprovalRequestGlobalId = approvalRequest.NextRevisionApprovalRequest?.GlobalId,
            NextRevisionApprovalRequestTitle = approvalRequest.NextRevisionApprovalRequest?.Title
        };
    }

    private static ApprovalRequestStepDto MapStep(
        ApprovalRequestStep step,
        Guid approvalRequestGlobalId,
        string createdByDisplayName,
        string createdByEmail,
        string createdByOrganizationDisplayName,
        IReadOnlyDictionary<long, Guid>? approverGlobalIdsById = null,
        ApprovalRequestApproverGlobalIdMaps? approverGlobalIdMaps = null,
        bool includeVisibility = true)
    {
        approverGlobalIdMaps ??= ApprovalRequestApproverGlobalIdMaps.Empty;
        return new ApprovalRequestStepDto
        {
            GlobalId = step.GlobalId,
            Sequence = step.Sequence,
            Mode = step.Mode,
            Action = step.Action,
            Approvers = step.Approvers.Select(approver => MapApprover(approver, approverGlobalIdMaps)).ToList(),
            Tasks = [.. step.Tasks.Select(task => MapTask(
                task,
                createdByDisplayName,
                createdByEmail,
                createdByOrganizationDisplayName,
                approvalRequestGlobalId,
                step.GlobalId,
                approverGlobalIdsById is not null
                    ? GetTaskApproverGlobalId(task, approverGlobalIdsById)
                    : null))],
            Visibility = includeVisibility
                ? [.. step.StepVisibilities.Select(visibility => MapStepVisibility(visibility, approverGlobalIdMaps))]
                : []
        };
    }

    private static ApprovalRequestApproverDto MapApprover(
        ApprovalRequestStepApprover approver,
        ApprovalRequestApproverGlobalIdMaps approverGlobalIdMaps)
    {
        return new ApprovalRequestApproverDto
        {
            GlobalId = approver.GlobalId,
            Type = approver.Type,
            Email = GetEmail(approver.User),
            EmployeeGlobalId = GetEmployeeGlobalId(approver, approverGlobalIdMaps),
            TeamGlobalId = GetTeamGlobalId(approver, approverGlobalIdMaps),
            DisplayName = approver.ApproverDisplayName
        };
    }

    private static ApprovalRequestStepDto MapStepForTask(
        ApprovalRequestStep step,
        Guid approvalRequestGlobalId,
        string createdByDisplayName,
        string createdByEmail,
        string createdByOrganizationDisplayName,
        long? approvalRequestStepApproverId,
        IReadOnlyDictionary<long, Guid> approverGlobalIdsById,
        ApprovalRequestApproverGlobalIdMaps approverGlobalIdMaps)
    {
        if (!StepIsVisibleToApprover(step, approvalRequestStepApproverId))
        {
            return new ApprovalRequestStepDto
            {
                Sequence = step.Sequence,
                IsVisible = false
            };
        }

        return MapStep(
            step,
            approvalRequestGlobalId,
            createdByDisplayName,
            createdByEmail,
            createdByOrganizationDisplayName,
            approverGlobalIdsById,
            approverGlobalIdMaps,
            includeVisibility: false);
    }

    private static ApprovalRequestStepVisibilityDto MapStepVisibility(
        ApprovalRequestStepVisibility visibility,
        ApprovalRequestApproverGlobalIdMaps approverGlobalIdMaps) => new()
        {
            ApproverGlobalId = visibility.ApprovalRequestStepApprover.GlobalId,
            ApproverType = visibility.ApprovalRequestStepApprover.Type,
            ApproverDisplayName = visibility.ApprovalRequestStepApprover.ApproverDisplayName,
            ApproverEmail = GetEmail(visibility.ApprovalRequestStepApprover.User),
            ApproverEmployeeGlobalId = GetEmployeeGlobalId(visibility.ApprovalRequestStepApprover, approverGlobalIdMaps),
            ApproverTeamGlobalId = GetTeamGlobalId(visibility.ApprovalRequestStepApprover, approverGlobalIdMaps),
            IsVisible = visibility.IsVisible
        };

    private static ApprovalRequestTaskDto MapTask(
        ApprovalRequestTask task,
        string? createdByDisplayName = null,
        string? createdByEmail = null,
        string? createdByOrganizationDisplayName = null,
        Guid? approvalRequestGlobalId = null,
        Guid? approvalRequestStepGlobalId = null,
        Guid? approvalRequestStepApproverGlobalId = null)
    {
        return new ApprovalRequestTaskDto
        {
            GlobalId = task.GlobalId,
            Title = task.Title,
            ApprovalRequestGlobalId = approvalRequestGlobalId ?? task.ApprovalRequest.GlobalId,
            ApprovalRequestStepGlobalId = approvalRequestStepGlobalId ?? task.ApprovalRequestStep.GlobalId,
            ApprovalRequestStepApproverGlobalId = approvalRequestStepApproverGlobalId ?? task.ApprovalRequestStepApprover?.GlobalId,
            ApproverUserId = task.ApproverUserId,
            ApproverEmail = GetEmail(task.ApproverUser),
            ApproverDisplayName = task.ApproverDisplayName,
            ApproverOrganizationDisplayName = task.ApproverOrganizationDisplayName,
            Action = task.Action,
            Result = task.Result,
            RequestedByEmail = createdByEmail ?? GetEmail(task.ApprovalRequest.CreatedByUser),
            RequestedByDisplayName = createdByDisplayName ?? task.ApprovalRequest.CreatedByDisplayName,
            CreatedByOrganizationDisplayName = createdByOrganizationDisplayName ?? task.ApprovalRequest.CreatedByOrganizationDisplayName,
            RevisionNumber = GetTaskRevisionNumber(task),
            Status = task.Status,
            CreatedAt = task.CreatedAt,
            CompletedAt = task.CompletedAt,
            Description = task.Description,
            Comment = task.Comment,
            ApproverIpAddress = task.ApproverIpAddress,
            ApproverBrowserData = task.ApproverBrowserData,
            ApproverLegalName = task.ApproverLegalName,
            HasApproverSignature = !string.IsNullOrWhiteSpace(task.ApproverSignatureJson),
            ApproverSignatureJson = task.ApproverSignatureJson
        };
    }

    private static UserFileDto MapUserFile(UserFile userFile)
    {
        return new UserFileDto
        {
            GlobalId = userFile.GlobalId,
            Name = userFile.Name,
            Type = userFile.Type,
            CreatedAt = userFile.CreatedAt,
            Size = userFile.Size
        };
    }

    private static ApprovalRequestFileDto MapRequestFile(ApprovalRequestFile requestFile)
    {
        return new ApprovalRequestFileDto
        {
            GlobalId = requestFile.GlobalId,
            UserFile = MapUserFile(requestFile.UserFile),
            Sequence = requestFile.Sequence,
            RevisionAction = requestFile.RevisionAction,
            PreviousApprovalRequestFileGlobalId = requestFile.PreviousApprovalRequestFile?.GlobalId,
            PreviousUserFile = requestFile.PreviousApprovalRequestFile is null
                ? null
                : MapUserFile(requestFile.PreviousApprovalRequestFile.UserFile)
        };
    }

    private static Guid? GetEmployeeGlobalId(
        ApprovalRequestStepApprover approver,
        ApprovalRequestApproverGlobalIdMaps approverGlobalIdMaps) =>
        approver.EmployeeId is { } employeeId
            && approverGlobalIdMaps.EmployeeGlobalIdsById.TryGetValue(employeeId, out var employeeGlobalId)
                ? employeeGlobalId
                : null;

    private static Guid? GetTeamGlobalId(
        ApprovalRequestStepApprover approver,
        ApprovalRequestApproverGlobalIdMaps approverGlobalIdMaps) =>
        approver.TeamId is { } teamId
            && approverGlobalIdMaps.TeamGlobalIdsById.TryGetValue(teamId, out var teamGlobalId)
                ? teamGlobalId
                : null;

    private static Guid? GetTaskApproverGlobalId(
        ApprovalRequestTask task,
        IReadOnlyDictionary<long, Guid> approverGlobalIdsById) =>
        task.ApprovalRequestStepApproverId is { } approverId
            ? approverGlobalIdsById.TryGetValue(approverId, out var globalId)
                ? globalId
                : task.ApprovalRequestStepApprover?.GlobalId
            : null;

    private static int GetTaskRevisionNumber(ApprovalRequestTask task) =>
        task.ApprovalRequest is { } approvalRequest
            ? approvalRequest.RevisionNumber
            : task.RevisionNumber;

    private static IEnumerable<ApprovalRequestFile> OrderRequestFiles(ApprovalRequest approvalRequest) =>
        approvalRequest.RequestFiles.OrderBy(file => file.Sequence);

    private static string GetEmail(AppUser? user)
    {
        return user?.NormalizedEmail ?? string.Empty;
    }

    private static bool StepIsVisibleToApprover(ApprovalRequestStep step, long? approvalRequestStepApproverId)
    {
        return approvalRequestStepApproverId is null
            || (step.StepVisibilities.SingleOrDefault(visibility =>
                visibility.ApprovalRequestStepApproverId == approvalRequestStepApproverId)
            ?.IsVisible ?? true);
    }
}
