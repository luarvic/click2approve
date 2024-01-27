namespace api.Models;

public class UserFile : IUserFile
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? Type { get; set; }
    public string? Thumbnail { get; set; }
    public DateTime? Created { get; set; }
}
