namespace api.Models;

public interface IUserFile
{
    long Id { get; set; }
    string? Name { get; set; }
    string? Type { get; set; }
    string? Thumbnail { get; set; }
    DateTime? Created { get; set; }
}
