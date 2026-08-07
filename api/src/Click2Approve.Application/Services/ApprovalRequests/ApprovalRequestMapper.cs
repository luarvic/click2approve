using Click2Approve.Application.Extensions;
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
        CreatedByEmail = approvalRequest.CreatedByUser.NormalizedEmailOrEmpty(),
        CreatedByDisplayName = approvalRequest.CreatedByDisplayName,
        OrganizationDisplayName = approvalRequest.OrganizationDisplayName,
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
        RequestedByEmail = task.ApprovalRequest.CreatedByUser.NormalizedEmailOrEmpty(),
        RequestedByDisplayName = task.ApprovalRequest.CreatedByDisplayName,
        OrganizationDisplayName = task.ApprovalRequest.OrganizationDisplayName,
        RevisionNumber = GetTaskRevisionNumber(task)
    };

    public static ApprovalRequestDto MapApprovalRequest(
        ApprovalRequest approvalRequest,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps)
    {
        var assigneeGlobalIdsById = approvalRequest.Steps
            .SelectMany(step => step.Assignees)
            .ToDictionary(assignee => assignee.Id, assignee => assignee.GlobalId);
        var createdByEmail = approvalRequest.CreatedByUser.NormalizedEmailOrEmpty();
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
                approvalRequest.OrganizationDisplayName,
                assigneeGlobalIdsById,
                assigneeGlobalIdMaps))],
            Description = approvalRequest.Description,
            CreatedAt = approvalRequest.CreatedAt,
            CompletedAt = approvalRequest.CompletedAt,
            CreatedByUserId = approvalRequest.CreatedByUserId,
            CreatedByEmail = createdByEmail,
            CreatedByDisplayName = approvalRequest.CreatedByDisplayName,
            CompletedByDisplayName = approvalRequest.CompletedByDisplayName,
            CompletedByEmail = approvalRequest.CompletedByUser.NormalizedEmailOrEmpty(),
            OrganizationDisplayName = approvalRequest.OrganizationDisplayName,
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
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps) => new(MapTask(task))
        {
            RequestFiles = [.. OrderRequestFiles(task.ApprovalRequest).Select(MapRequestFile)],
            ApprovalRequest = approvalRequest is not null
            ? MapApprovalRequestForTask(approvalRequest, task.ApprovalRequestStepAssigneeId, assigneeGlobalIdMaps)
            : null,
            AssigneeSignatureJson = task.AssigneeSignatureJson
        };

    private static ApprovalRequestDto MapApprovalRequestForTask(
        ApprovalRequest approvalRequest,
        long? approvalRequestStepAssigneeId,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps)
    {
        var visibleSteps = approvalRequest.Steps
            .Where(step => StepIsVisibleToAssignee(step, approvalRequestStepAssigneeId))
            .ToList();
        var assigneeGlobalIdsById = approvalRequest.Steps
            .SelectMany(step => step.Assignees)
            .ToDictionary(assignee => assignee.Id, assignee => assignee.GlobalId);

        var createdByEmail = approvalRequest.CreatedByUser.NormalizedEmailOrEmpty();
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
                approvalRequest.OrganizationDisplayName,
                approvalRequestStepAssigneeId,
                assigneeGlobalIdsById,
                assigneeGlobalIdMaps))],
            Description = approvalRequest.Description,
            CreatedAt = approvalRequest.CreatedAt,
            CompletedAt = approvalRequest.CompletedAt,
            CreatedByUserId = approvalRequest.CreatedByUserId,
            CreatedByEmail = createdByEmail,
            CreatedByDisplayName = approvalRequest.CreatedByDisplayName,
            CompletedByDisplayName = approvalRequest.CompletedByDisplayName,
            CompletedByEmail = approvalRequest.CompletedByUser.NormalizedEmailOrEmpty(),
            OrganizationDisplayName = approvalRequest.OrganizationDisplayName,
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
        string organizationDisplayName,
        IReadOnlyDictionary<long, Guid>? assigneeGlobalIdsById = null,
        ApprovalRequestAssigneeGlobalIdMaps? assigneeGlobalIdMaps = null,
        bool includeVisibility = true)
    {
        assigneeGlobalIdMaps ??= ApprovalRequestAssigneeGlobalIdMaps.Empty;
        return new ApprovalRequestStepDto
        {
            GlobalId = step.GlobalId,
            Sequence = step.Sequence,
            Mode = step.Mode,
            Action = step.Action,
            Assignees = step.Assignees.Select(assignee => MapAssignee(assignee, assigneeGlobalIdMaps)).ToList(),
            Tasks = [.. step.Tasks.Select(task => MapTask(
                task,
                createdByDisplayName,
                createdByEmail,
                organizationDisplayName,
                approvalRequestGlobalId,
                step.GlobalId,
                assigneeGlobalIdsById is not null
                    ? GetTaskAssigneeGlobalId(task, assigneeGlobalIdsById)
                    : null))],
            Visibility = includeVisibility
                ? [.. step.StepVisibilities.Select(visibility => MapStepVisibility(visibility, assigneeGlobalIdMaps))]
                : []
        };
    }

    private static ApprovalRequestAssigneeDto MapAssignee(
        ApprovalRequestStepAssignee assignee,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps)
    {
        return new ApprovalRequestAssigneeDto
        {
            GlobalId = assignee.GlobalId,
            Type = assignee.Type,
            Email = assignee.User.NormalizedEmailOrEmpty(),
            EmployeeGlobalId = GetEmployeeGlobalId(assignee, assigneeGlobalIdMaps),
            TeamGlobalId = GetTeamGlobalId(assignee, assigneeGlobalIdMaps),
            DisplayName = assignee.AssigneeDisplayName
        };
    }

    private static ApprovalRequestStepDto MapStepForTask(
        ApprovalRequestStep step,
        Guid approvalRequestGlobalId,
        string createdByDisplayName,
        string createdByEmail,
        string organizationDisplayName,
        long? approvalRequestStepAssigneeId,
        IReadOnlyDictionary<long, Guid> assigneeGlobalIdsById,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps)
    {
        if (!StepIsVisibleToAssignee(step, approvalRequestStepAssigneeId))
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
            organizationDisplayName,
            assigneeGlobalIdsById,
            assigneeGlobalIdMaps,
            includeVisibility: false);
    }

    private static ApprovalRequestStepVisibilityDto MapStepVisibility(
        ApprovalRequestStepVisibility visibility,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps) => new()
        {
            AssigneeGlobalId = visibility.ApprovalRequestStepAssignee.GlobalId,
            AssigneeType = visibility.ApprovalRequestStepAssignee.Type,
            AssigneeDisplayName = visibility.ApprovalRequestStepAssignee.AssigneeDisplayName,
            AssigneeEmail = visibility.ApprovalRequestStepAssignee.User.NormalizedEmailOrEmpty(),
            AssigneeEmployeeGlobalId = GetEmployeeGlobalId(visibility.ApprovalRequestStepAssignee, assigneeGlobalIdMaps),
            AssigneeTeamGlobalId = GetTeamGlobalId(visibility.ApprovalRequestStepAssignee, assigneeGlobalIdMaps),
            IsVisible = visibility.IsVisible
        };

    private static ApprovalRequestTaskDto MapTask(
        ApprovalRequestTask task,
        string? createdByDisplayName = null,
        string? createdByEmail = null,
        string? organizationDisplayName = null,
        Guid? approvalRequestGlobalId = null,
        Guid? approvalRequestStepGlobalId = null,
        Guid? approvalRequestStepAssigneeGlobalId = null)
    {
        return new ApprovalRequestTaskDto
        {
            GlobalId = task.GlobalId,
            Title = task.Title,
            ApprovalRequestGlobalId = approvalRequestGlobalId ?? task.ApprovalRequest.GlobalId,
            ApprovalRequestStepGlobalId = approvalRequestStepGlobalId ?? task.ApprovalRequestStep.GlobalId,
            ApprovalRequestStepAssigneeGlobalId = approvalRequestStepAssigneeGlobalId ?? task.ApprovalRequestStepAssignee?.GlobalId,
            AssigneeUserId = task.AssigneeUserId,
            AssigneeEmail = task.AssigneeUser.NormalizedEmailOrEmpty(),
            AssigneeDisplayName = task.AssigneeDisplayName,
            CompletedByDisplayName = task.CompletedByDisplayName,
            CompletedByEmail = task.CompletedByUser.NormalizedEmailOrEmpty(),
            Action = task.Action,
            Result = task.Result,
            RequestedByEmail = createdByEmail ?? task.ApprovalRequest.CreatedByUser.NormalizedEmailOrEmpty(),
            RequestedByDisplayName = createdByDisplayName ?? task.ApprovalRequest.CreatedByDisplayName,
            OrganizationDisplayName = organizationDisplayName
                ?? task.OrganizationDisplayName
                ?? task.ApprovalRequest.OrganizationDisplayName,
            RevisionNumber = GetTaskRevisionNumber(task),
            Status = task.Status,
            CreatedAt = task.CreatedAt,
            CompletedAt = task.CompletedAt,
            Description = task.Description,
            Comment = task.Comment,
            AssigneeIpAddress = task.AssigneeIpAddress,
            AssigneeBrowserData = task.AssigneeBrowserData,
            AssigneeLegalName = task.AssigneeLegalName,
            AssigneeOrganization = task.AssigneeEmployeeId.HasValue
                ? null
                : task.AssigneeOrganization,
            HasAssigneeSignature = !string.IsNullOrWhiteSpace(task.AssigneeSignatureJson),
            IsAssigneeEmployee = task.AssigneeEmployeeId.HasValue,
            AssigneeSignatureJson = task.AssigneeSignatureJson
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
        ApprovalRequestStepAssignee assignee,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps) =>
        assignee.EmployeeId is { } employeeId
            && assigneeGlobalIdMaps.EmployeeGlobalIdsById.TryGetValue(employeeId, out var employeeGlobalId)
                ? employeeGlobalId
                : null;

    private static Guid? GetTeamGlobalId(
        ApprovalRequestStepAssignee assignee,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps) =>
        assignee.TeamId is { } teamId
            && assigneeGlobalIdMaps.TeamGlobalIdsById.TryGetValue(teamId, out var teamGlobalId)
                ? teamGlobalId
                : null;

    private static Guid? GetTaskAssigneeGlobalId(
        ApprovalRequestTask task,
        IReadOnlyDictionary<long, Guid> assigneeGlobalIdsById) =>
        task.ApprovalRequestStepAssigneeId is { } assigneeId
            ? assigneeGlobalIdsById.TryGetValue(assigneeId, out var globalId)
                ? globalId
                : task.ApprovalRequestStepAssignee?.GlobalId
            : null;

    private static int GetTaskRevisionNumber(ApprovalRequestTask task) =>
        task.ApprovalRequest is { } approvalRequest
            ? approvalRequest.RevisionNumber
            : task.RevisionNumber;

    private static IEnumerable<ApprovalRequestFile> OrderRequestFiles(ApprovalRequest approvalRequest) =>
        approvalRequest.RequestFiles.OrderBy(file => file.Sequence);

    private static bool StepIsVisibleToAssignee(ApprovalRequestStep step, long? approvalRequestStepAssigneeId)
    {
        return approvalRequestStepAssigneeId is null
            || (step.StepVisibilities.SingleOrDefault(visibility =>
                visibility.ApprovalRequestStepAssigneeId == approvalRequestStepAssigneeId)
            ?.IsVisible ?? true);
    }
}
