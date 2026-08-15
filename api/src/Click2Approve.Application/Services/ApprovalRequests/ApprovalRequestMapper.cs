using Click2Approve.Application.Extensions;
using Click2Approve.Application.Models.ApprovalRequests;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Maps approval request domain models to approval request results.
/// </summary>
internal static class ApprovalRequestMapper
{
    public static ApprovalRequestListItemResult MapApprovalRequestListItem(ApprovalRequest approvalRequest) => new()
    {
        GlobalId = approvalRequest.GlobalId,
        Title = approvalRequest.Title,
        Status = approvalRequest.Status,
        Result = approvalRequest.Result,
        CreatedAt = approvalRequest.CreatedAt,
        CompletedAt = approvalRequest.CompletedAt,
        CreatedByEmail = approvalRequest.CreatedByUser.NormalizedEmailOrEmpty(),
        CreatedByDisplayName = GetRequesterDisplayName(approvalRequest),
        OrganizationDisplayName = approvalRequest.OrganizationDisplayName,
        RevisionNumber = approvalRequest.RevisionNumber
    };

    public static ApprovalRequestTaskListItemResult MapTaskListItem(ApprovalRequestTask task) => new()
    {
        GlobalId = task.GlobalId,
        Title = task.Title,
        Action = task.Action,
        Status = task.Status,
        Result = task.Result,
        CreatedAt = task.CreatedAt,
        CompletedAt = task.CompletedAt,
        RequestedByEmail = task.ApprovalRequest.CreatedByUser.NormalizedEmailOrEmpty(),
        RequestedByDisplayName = GetRequesterDisplayName(task.ApprovalRequest),
        OrganizationDisplayName = task.ApprovalRequest.OrganizationDisplayName,
        RevisionNumber = GetTaskRevisionNumber(task)
    };

    public static ApprovalRequestDetailsResult MapApprovalRequest(
        ApprovalRequest approvalRequest,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps)
    {
        var assigneeGlobalIdsById = approvalRequest.Steps
            .SelectMany(step => step.Assignees)
            .ToDictionary(assignee => assignee.Id, assignee => assignee.GlobalId);
        var createdByEmail = approvalRequest.CreatedByUser.NormalizedEmailOrEmpty();
        var createdByDisplayName = GetRequesterDisplayName(approvalRequest);
        return new ApprovalRequestDetailsResult
        {
            GlobalId = approvalRequest.GlobalId,
            Title = approvalRequest.Title,
            RequestFiles = [.. OrderRequestFiles(approvalRequest).Select(MapRequestFile)],
            Steps = [.. approvalRequest.Steps.Select(step => MapStep(
                step,
                approvalRequest.GlobalId,
                createdByDisplayName,
                createdByEmail,
                approvalRequest.OrganizationDisplayName,
                assigneeGlobalIdsById,
                assigneeGlobalIdMaps))],
            Description = approvalRequest.Description,
            CreatedAt = approvalRequest.CreatedAt,
            CompletedAt = approvalRequest.CompletedAt,
            CreatedByUserGlobalId = approvalRequest.CreatedByUser.GlobalId,
            CreatedByEmployeeGlobalId = GetEmployeeGlobalId(
                approvalRequest.CreatedByEmployeeId,
                assigneeGlobalIdMaps),
            CompletedByUserGlobalId = approvalRequest.CompletedByUser?.GlobalId,
            CompletedByEmployeeGlobalId = GetEmployeeGlobalId(
                approvalRequest.CompletedByEmployeeId,
                assigneeGlobalIdMaps),
            CreatedByEmail = createdByEmail,
            CreatedByDisplayName = createdByDisplayName,
            CompletedByDisplayName = GetRequestCompleterDisplayName(approvalRequest),
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

    public static ApprovalRequestTaskDetailsResult MapTaskDetail(
        ApprovalRequestTaskWithHiddenStepSequencesResult taskWithHiddenStepSequences,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps) => new(MapTask(taskWithHiddenStepSequences.Task))
        {
            RequestFiles = [.. OrderRequestFiles(taskWithHiddenStepSequences.Task.ApprovalRequest).Select(MapRequestFile)],
            ApprovalRequest = MapApprovalRequestForTask(taskWithHiddenStepSequences, assigneeGlobalIdMaps),
            AssigneeSignatureJson = taskWithHiddenStepSequences.Task.AssigneeSignatureJson
        };

    private static ApprovalRequestDetailsResult MapApprovalRequestForTask(
        ApprovalRequestTaskWithHiddenStepSequencesResult taskWithHiddenStepSequences,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps)
    {
        var approvalRequest = taskWithHiddenStepSequences.Task.ApprovalRequest;
        var assigneeGlobalIdsById = approvalRequest.Steps
            .SelectMany(step => step.Assignees)
            .ToDictionary(assignee => assignee.Id, assignee => assignee.GlobalId);

        var createdByEmail = approvalRequest.CreatedByUser.NormalizedEmailOrEmpty();
        var createdByDisplayName = GetRequesterDisplayName(approvalRequest);
        return new ApprovalRequestDetailsResult
        {
            GlobalId = approvalRequest.GlobalId,
            Title = approvalRequest.Title,
            RequestFiles = [.. OrderRequestFiles(approvalRequest).Select(MapRequestFile)],
            Steps = [.. approvalRequest.Steps.Select(step => MapStep(
                step,
                approvalRequest.GlobalId,
                createdByDisplayName,
                createdByEmail,
                approvalRequest.OrganizationDisplayName,
                assigneeGlobalIdsById,
                assigneeGlobalIdMaps,
                includeVisibility: false)), .. taskWithHiddenStepSequences.HiddenStepSequences.Select(MapHiddenStep)],
            Description = approvalRequest.Description,
            CreatedAt = approvalRequest.CreatedAt,
            CompletedAt = approvalRequest.CompletedAt,
            CreatedByUserGlobalId = approvalRequest.CreatedByUser.GlobalId,
            CreatedByEmployeeGlobalId = GetEmployeeGlobalId(
                approvalRequest.CreatedByEmployeeId,
                assigneeGlobalIdMaps),
            CompletedByUserGlobalId = approvalRequest.CompletedByUser?.GlobalId,
            CompletedByEmployeeGlobalId = GetEmployeeGlobalId(
                approvalRequest.CompletedByEmployeeId,
                assigneeGlobalIdMaps),
            CreatedByEmail = createdByEmail,
            CreatedByDisplayName = createdByDisplayName,
            CompletedByDisplayName = GetRequestCompleterDisplayName(approvalRequest),
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

    private static ApprovalRequestStepResult MapStep(
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
        return new ApprovalRequestStepResult
        {
            GlobalId = step.GlobalId,
            Sequence = step.Sequence,
            Mode = step.Mode,
            Action = step.Action,
            VisibilityMode = includeVisibility ? step.VisibilityMode : null,
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

    private static ApprovalRequestAssigneeResult MapAssignee(
        ApprovalRequestStepAssignee assignee,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps)
    {
        return new ApprovalRequestAssigneeResult
        {
            GlobalId = assignee.GlobalId,
            Type = assignee.Type,
            Email = assignee.User.NormalizedEmailOrEmpty(),
            EmployeeGlobalId = GetEmployeeGlobalId(assignee, assigneeGlobalIdMaps),
            TeamGlobalId = GetTeamGlobalId(assignee, assigneeGlobalIdMaps),
            DisplayName = GetAssigneeDisplayName(assignee)
        };
    }

    private static ApprovalRequestStepResult MapHiddenStep(int sequence) => new()
    {
        Sequence = sequence,
        IsVisible = false
    };

    private static ApprovalRequestStepVisibilityResult MapStepVisibility(
        ApprovalRequestStepVisibility visibility,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps) => new()
        {
            AssigneeGlobalId = visibility.ApprovalRequestStepAssignee.GlobalId,
            AssigneeType = visibility.ApprovalRequestStepAssignee.Type,
            AssigneeDisplayName = GetAssigneeDisplayName(visibility.ApprovalRequestStepAssignee),
            AssigneeEmail = visibility.ApprovalRequestStepAssignee.User.NormalizedEmailOrEmpty(),
            AssigneeEmployeeGlobalId = GetEmployeeGlobalId(visibility.ApprovalRequestStepAssignee, assigneeGlobalIdMaps),
            AssigneeTeamGlobalId = GetTeamGlobalId(visibility.ApprovalRequestStepAssignee, assigneeGlobalIdMaps),
            IsVisible = visibility.IsVisible
        };

    private static ApprovalRequestTaskResult MapTask(
        ApprovalRequestTask task,
        string? createdByDisplayName = null,
        string? createdByEmail = null,
        string? organizationDisplayName = null,
        Guid? approvalRequestGlobalId = null,
        Guid? approvalRequestStepGlobalId = null,
        Guid? approvalRequestStepAssigneeGlobalId = null)
    {
        return new ApprovalRequestTaskResult
        {
            GlobalId = task.GlobalId,
            Title = task.Title,
            ApprovalRequestGlobalId = approvalRequestGlobalId ?? task.ApprovalRequest.GlobalId,
            ApprovalRequestStepGlobalId = approvalRequestStepGlobalId ?? task.ApprovalRequestStep.GlobalId,
            ApprovalRequestStepAssigneeGlobalId = approvalRequestStepAssigneeGlobalId ?? task.ApprovalRequestStepAssignee?.GlobalId,
            AssigneeEmail = task.AssigneeUser.NormalizedEmailOrEmpty(),
            AssigneeDisplayName = GetAssigneeDisplayName(task),
            CompletedByDisplayName = GetTaskCompleterDisplayName(task),
            CompletedByEmail = task.CompletedByUser.NormalizedEmailOrEmpty(),
            Action = task.Action,
            Result = task.Result,
            RequestedByEmail = createdByEmail ?? task.ApprovalRequest.CreatedByUser.NormalizedEmailOrEmpty(),
            RequestedByDisplayName = createdByDisplayName ?? GetRequesterDisplayName(task.ApprovalRequest),
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
            AssigneeSignatureJson = task.AssigneeSignatureJson,
            TaskFiles = [.. task.TaskFiles.Select(MapUserFile)]
        };
    }

    private static UserFileResult MapUserFile(UserFile userFile)
    {
        return new UserFileResult
        {
            GlobalId = userFile.GlobalId,
            Name = userFile.Name,
            Type = userFile.Type,
            CreatedAt = userFile.CreatedAt,
            Size = userFile.Size
        };
    }

    private static ApprovalRequestFileResult MapRequestFile(ApprovalRequestFile requestFile)
    {
        return new ApprovalRequestFileResult
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

    private static string GetRequesterDisplayName(ApprovalRequest approvalRequest) =>
        approvalRequest.CreatedByEmployeeId.HasValue
            ? approvalRequest.CreatedByDisplayName
            : approvalRequest.CreatedByUser.NormalizedEmailOrEmpty();

    private static string? GetRequestCompleterDisplayName(ApprovalRequest approvalRequest) =>
        approvalRequest.CompletedByEmployeeId.HasValue
            ? approvalRequest.CompletedByDisplayName
            : approvalRequest.CompletedByUser.NormalizedEmailOrEmpty();

    private static string GetAssigneeDisplayName(ApprovalRequestStepAssignee assignee) =>
        assignee.EmployeeId.HasValue
            ? assignee.AssigneeDisplayName ?? assignee.User.NormalizedEmailOrEmpty()
            : assignee.TeamId.HasValue
                ? assignee.AssigneeDisplayName ?? string.Empty
            : assignee.User.NormalizedEmailOrEmpty();

    private static string GetAssigneeDisplayName(ApprovalRequestTask task) =>
        task.AssigneeEmployeeId.HasValue
            ? task.AssigneeDisplayName
            : task.AssigneeUser.NormalizedEmailOrEmpty();

    private static string? GetTaskCompleterDisplayName(ApprovalRequestTask task) =>
        task.CompletedByEmployeeId.HasValue
            ? task.CompletedByDisplayName
            : task.CompletedByUser.NormalizedEmailOrEmpty();

    private static Guid? GetEmployeeGlobalId(
        long? employeeId,
        ApprovalRequestAssigneeGlobalIdMaps assigneeGlobalIdMaps) =>
        employeeId is { } id
        && assigneeGlobalIdMaps.EmployeeGlobalIdsById.TryGetValue(id, out var employeeGlobalId)
            ? employeeGlobalId
            : null;

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

}
