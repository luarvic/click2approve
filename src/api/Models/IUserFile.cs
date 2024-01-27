namespace api.Models;

public interface IUserFile
{
    string? Id { get; set; }
    string? Name { get; set; }
    string? Type { get; set; }
    string? Thumbnail { get; set; }
    DateTime? Created { get; set; }
}
