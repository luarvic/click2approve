namespace api.Models.DTOs;

// Represents payload that contains files to share.
public class FilesToShare
{
    public required string[] Ids { get; set; }
    public required DateTime AvailableUntil { get; set; }
}
