using api.Models;

namespace api.Services;

// An interface that defines a contract for a service that manages user files (uploads, gets, deletes, etc.).
public interface IFileService
{
    Task<IList<IUserFile>> UploadFilesAsync(IFormFileCollection files);
}
