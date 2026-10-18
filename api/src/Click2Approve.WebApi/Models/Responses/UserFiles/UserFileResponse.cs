namespace Click2Approve.WebApi.Models.Responses.UserFiles;

/// <summary>
/// Represents a file attached to an approval request.
/// </summary>
public class UserFileResponse
{
    /// <summary>Global identifier of the user file.</summary>
    public Guid GlobalId { get; init; }
    /// <summary>Name of the user file.</summary>
    public required string Name { get; init; }
    /// <summary>Media type of the uploaded file.</summary>
    public required string Type { get; init; }
    /// <summary>Time when the user file was created.</summary>
    public DateTime CreatedAt { get; init; }
    /// <summary>File size in bytes.</summary>
    public long Size { get; init; }
}
