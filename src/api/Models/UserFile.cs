namespace api.Models;

public class UserFile : IUserFile
{
    public long Id { get; set; }
    public string? Name { get; set; }
    public string? Type { get; set; }
    public DateTime? Created { get; set; }
}
