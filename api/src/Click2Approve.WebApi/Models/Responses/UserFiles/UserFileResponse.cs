namespace Click2Approve.WebApi.Models.Responses.UserFiles;

/// <summary>
/// Represents a file attached to an approval request.
/// </summary>
public class UserFileResponse
{
    public Guid GlobalId { get; init; }
    public required string Name { get; init; }
    public required string Type { get; init; }
    public DateTime CreatedAt { get; init; }
    public long Size { get; init; }
}
