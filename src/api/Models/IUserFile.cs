namespace api.Models;

// An interface that defines a contract for an EF model that represents a user's file.
public interface IUserFile
{
    long Id { get; set; }
    string? Name { get; set; }
    string? Type { get; set; }
    DateTime? Created { get; set; }
}
