namespace api.Models;

// An EF model that represents a user's file.
public class UserFile
{
    public long Id { get; set; }
    public required string Name { get; set; }
    public string Thumbnail { get => $"{Id}-thumbnail.png"; }
    public required string Type { get; set; }
    public DateTime Created { get; set; }
    public required string Owner { get; set;}
}
