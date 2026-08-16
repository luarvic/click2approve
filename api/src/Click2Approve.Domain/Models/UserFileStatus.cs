namespace Click2Approve.Domain.Models;

/// <summary>
/// Identifies whether a user file is awaiting attachment or has been attached.
/// </summary>
public enum UserFileStatus
{
    Uploaded = 0,
    Attached = 1
}
