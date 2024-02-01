namespace api.Models.DTOs;

public class FilesToShare
{
    public required string[] Ids { get; set; }
    public required DateTime AvailableUntil { get; set; }
}
