using Click2Approve.Application.Models.Files;

namespace Click2Approve.Application.Models.Commands.UserFiles;

/// <summary>Uploads files to the current workspace or to an accessible request's workspace.</summary>
public sealed record UploadUserFilesCommand(
    IReadOnlyCollection<UploadedFile> Files,
    Guid? RequestGlobalId,
    Guid? TaskGlobalId);
