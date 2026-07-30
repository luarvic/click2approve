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
        CreatedAt = approvalRequest.CreatedAt,
        CreatedByDisplayName = approvalRequest.CreatedByDisplayName,
        RevisionNumber = approvalRequest.RevisionNumber
    };

    public static ApprovalRequestTaskListItemDto MapTaskListItem(ApprovalRequestTask task) => new()
    {
        GlobalId = task.GlobalId,
        Title = task.Title,
        Status = task.Status,
        CreatedAt = task.CreatedAt,
        RequestedByDisplayName = task.ApprovalRequest.CreatedByDisplayName,
        RevisionNumber = GetTaskRevisionNumber(task)
    };

    public static ApprovalRequestDto MapApprovalRequest(
        ApprovalRequest approvalRequest,
        ApprovalRequestApproverGlobalIdMaps approverGlobalIdMaps)
    {
        var approverGlobalIdsById = approvalRequest.Steps
            .SelectMany(step => step.Approvers)
            .ToDictionary(approver => approver.Id, approver => approver.GlobalId);
        var tasks = approvalRequest.Steps
            .SelectMany(step => step.Tasks)
            .DistinctBy(task => task.Id)
            .ToList();

        return new ApprovalRequestDto
        {
            GlobalId = approvalRequest.GlobalId,
            Title = approvalRequest.Title,
            RequestFiles = [.. OrderRequestFiles(approvalRequest).Select(MapRequestFile)],
            Steps = [.. approvalRequest.Steps.Select(step => MapStep(
                step,
                approvalRequest.GlobalId,
                approvalRequest.CreatedByDisplayName,
                approverGlobalIdsById,
                approverGlobalIdMaps))],
            Description = approvalRequest.Description,
            CreatedAt = approvalRequest.CreatedAt,
            CreatedByUserId = approvalRequest.CreatedByUserId,
            CreatedByEmail = approvalRequest.CreatedByEmail,
            CreatedByDisplayName = approvalRequest.CreatedByDisplayName,
            Status = approvalRequest.Status,
            RevisionNumber = approvalRequest.RevisionNumber,
            PreviousRevisionApprovalRequestGlobalId = approvalRequest.PreviousRevisionApprovalRequest?.GlobalId,
            PreviousRevisionApprovalRequestTitle = approvalRequest.PreviousRevisionApprovalRequest?.Title,
            NextRevisionApprovalRequestGlobalId = approvalRequest.NextRevisionApprovalRequest?.GlobalId,
            NextRevisionApprovalRequestTitle = approvalRequest.NextRevisionApprovalRequest?.Title,
            LogEntries = [.. approvalRequest.LogEntries.Select(MapLogEntry)],
            TaskLogEntries = [.. tasks.SelectMany(task => task.LogEntries).Select(MapTaskLogEntry)]
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
            : null
        };

    private static ApprovalRequestDto MapApprovalRequestForTask(
        ApprovalRequest approvalRequest,
        long? approvalRequestStepApproverId,
        ApprovalRequestApproverGlobalIdMaps approverGlobalIdMaps)
    {
        var visibleSteps = approvalRequest.Steps
            .Where(step => StepIsVisibleToApprover(step, approvalRequestStepApproverId))
            .ToList();
        var tasks = visibleSteps
            .SelectMany(step => step.Tasks)
            .DistinctBy(task => task.Id)
            .ToList();
        var approverGlobalIdsById = approvalRequest.Steps
            .SelectMany(step => step.Approvers)
            .ToDictionary(approver => approver.Id, approver => approver.GlobalId);

        return new ApprovalRequestDto
        {
            GlobalId = approvalRequest.GlobalId,
            Title = approvalRequest.Title,
            RequestFiles = [.. OrderRequestFiles(approvalRequest).Select(MapRequestFile)],
            Steps = [.. approvalRequest.Steps.Select(step => MapStepForTask(
                step,
                approvalRequest.GlobalId,
                approvalRequest.CreatedByDisplayName,
                approvalRequestStepApproverId,
                approverGlobalIdsById,
                approverGlobalIdMaps))],
            Description = approvalRequest.Description,
            CreatedAt = approvalRequest.CreatedAt,
            CreatedByUserId = approvalRequest.CreatedByUserId,
            CreatedByEmail = approvalRequest.CreatedByEmail,
            CreatedByDisplayName = approvalRequest.CreatedByDisplayName,
            Status = approvalRequest.Status,
            RevisionNumber = approvalRequest.RevisionNumber,
            PreviousRevisionApprovalRequestGlobalId = approvalRequest.PreviousRevisionApprovalRequest?.GlobalId,
            PreviousRevisionApprovalRequestTitle = approvalRequest.PreviousRevisionApprovalRequest?.Title,
            NextRevisionApprovalRequestGlobalId = approvalRequest.NextRevisionApprovalRequest?.GlobalId,
            NextRevisionApprovalRequestTitle = approvalRequest.NextRevisionApprovalRequest?.Title,
            LogEntries = [.. approvalRequest.LogEntries.Select(MapLogEntry)],
            TaskLogEntries = [.. tasks.SelectMany(task => task.LogEntries).Select(MapTaskLogEntry)]
        };
    }

    private static ApprovalRequestStepDto MapStep(
        ApprovalRequestStep step,
        Guid approvalRequestGlobalId,
        string createdByDisplayName,
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
            Approvers = step.Approvers.Select(approver => MapApprover(approver, approverGlobalIdMaps)).ToList(),
            Tasks = [.. step.Tasks.Select(task => MapTask(
                task,
                createdByDisplayName,
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
            Email = approver.Email,
            EmployeeGlobalId = GetEmployeeGlobalId(approver, approverGlobalIdMaps),
            TeamGlobalId = GetTeamGlobalId(approver, approverGlobalIdMaps),
            DisplayName = approver.ApproverDisplayName
        };
    }

    private static ApprovalRequestStepDto MapStepForTask(
        ApprovalRequestStep step,
        Guid approvalRequestGlobalId,
        string createdByDisplayName,
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
            ApproverEmail = visibility.ApprovalRequestStepApprover.Email,
            ApproverEmployeeGlobalId = GetEmployeeGlobalId(visibility.ApprovalRequestStepApprover, approverGlobalIdMaps),
            ApproverTeamGlobalId = GetTeamGlobalId(visibility.ApprovalRequestStepApprover, approverGlobalIdMaps),
            IsVisible = visibility.IsVisible
        };

    private static ApprovalRequestTaskDto MapTask(
        ApprovalRequestTask task,
        string? createdByDisplayName = null,
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
            ApproverEmail = task.ApproverEmail,
            ApproverDisplayName = task.ApproverDisplayName,
            RequestedByDisplayName = createdByDisplayName ?? task.ApprovalRequest.CreatedByDisplayName,
            RevisionNumber = GetTaskRevisionNumber(task),
            Status = task.Status,
            CreatedAt = task.CreatedAt,
            Description = task.Description,
            Comment = task.Comment,
            LogEntries = [.. task.LogEntries.Select(MapTaskLogEntry)]
        };
    }

    private static ApprovalRequestLogEntryDto MapLogEntry(ApprovalRequestLogEntry logEntry) => new()
    {
        GlobalId = logEntry.GlobalId,
        Timestamp = logEntry.Timestamp,
        ActorType = logEntry.ActorType,
        ActorUserId = logEntry.ActorUserId,
        ActorEmployeeId = logEntry.ActorEmployeeId,
        ActorEmail = logEntry.ActorEmail,
        ActorDisplayName = logEntry.ActorDisplayName,
        EventType = logEntry.EventType,
        Details = logEntry.Details
    };

    private static ApprovalRequestTaskLogEntryDto MapTaskLogEntry(ApprovalRequestTaskLogEntry logEntry) => new()
    {
        GlobalId = logEntry.GlobalId,
        ApprovalRequestTaskGlobalId = logEntry.ApprovalRequestTask.GlobalId,
        Timestamp = logEntry.Timestamp,
        ActorType = logEntry.ActorType,
        ActorUserId = logEntry.ActorUserId,
        ActorEmployeeId = logEntry.ActorEmployeeId,
        ActorEmail = logEntry.ActorEmail,
        ActorDisplayName = logEntry.ActorDisplayName,
        OnBehalfOfActorType = logEntry.OnBehalfOfActorType,
        OnBehalfOfUserId = logEntry.OnBehalfOfUserId,
        OnBehalfOfEmployeeId = logEntry.OnBehalfOfEmployeeId,
        OnBehalfOfEmail = logEntry.OnBehalfOfEmail,
        OnBehalfOfDisplayName = logEntry.OnBehalfOfDisplayName,
        EventType = logEntry.EventType,
        Details = logEntry.Details
    };

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

    private static bool StepIsVisibleToApprover(ApprovalRequestStep step, long? approvalRequestStepApproverId)
    {
        return approvalRequestStepApproverId is null
            || (step.StepVisibilities.SingleOrDefault(visibility =>
                visibility.ApprovalRequestStepApproverId == approvalRequestStepApproverId)
            ?.IsVisible ?? true);
    }
}
