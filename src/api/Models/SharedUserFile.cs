namespace api.Models;

// Represents a shared user's file.
public class SharedUserFile
{
    public long Id { get; set; }
    public required string Key { get; set; }
    public required UserFile UserFile { get; set; }
    public required DateTime AvailableUntil { get; set; }
}
