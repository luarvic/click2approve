using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.UserFiles;

/// <summary>
/// Maps user file domain models to user file results.
/// </summary>
public static class UserFileMapper
{
    public static UserFileResult MapUserFile(UserFile userFile) => new()
    {
        GlobalId = userFile.GlobalId,
        Name = userFile.Name,
        Type = userFile.Type,
        CreatedAt = userFile.CreatedAt,
        Size = userFile.Size
    };
}
