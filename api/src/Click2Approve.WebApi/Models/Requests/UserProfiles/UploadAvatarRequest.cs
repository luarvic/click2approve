namespace Click2Approve.WebApi.Models.Requests.UserProfiles;

/// <summary>
/// Identifies a temporary file to promote as the user's avatar.
/// </summary>
public class UploadAvatarRequest
{
    public required Guid UserFileGlobalId { get; set; }
}
