namespace api.Models;

// An EF model that represents a user's file.
public class UserFile : IUserFile
{
    public long Id { get; set; }
    public string? Name { get; set; }
    public string? Type { get; set; }
    public DateTime? Created { get; set; }
}
