using Click2Approve.Application.Models.Commands.UserFiles;
using Click2Approve.Application.Models.Files;

namespace Click2Approve.WebApi.Mappers.UserFiles;

/// <summary>Maps upload inputs to an application command.</summary>
public static class UserFileRequestMapper
{
    public static UploadUserFilesCommand Map(
        IReadOnlyCollection<UploadedFile> files,
        Guid? requestGlobalId,
        Guid? taskGlobalId) => new(files, requestGlobalId, taskGlobalId);
}
