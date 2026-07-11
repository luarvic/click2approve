namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents a file attached to an approval request.
/// </summary>
public class UserFileDto
{
    public long Id { get; init; }
    public required string Name { get; init; }
    public required string Type { get; init; }
    public DateTime CreatedAt { get; init; }
    public long Size { get; init; }
}
