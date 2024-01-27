using api.Models;

namespace api.Services;

public interface IFileService
{
    Task<IList<IUserFile>> UploadFilesAsync(IFormFileCollection files);
}