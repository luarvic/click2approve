namespace api.Helpers;

// A set of static helpers for I/O operations with files.
public static class FileHelpers
{
    public static async Task SaveFileAsync(IFormFile file, string? directory, string? subdirectory)
    {
        if (string.IsNullOrWhiteSpace(directory))
        {
            throw new Exception("The root directory for storing files is not defined.");
        }
        if (string.IsNullOrWhiteSpace(subdirectory))
        {
            throw new Exception("The subdirectory for storing files is not defined.");
        }
        var subdirectoryPath = $"{directory}/{subdirectory}";
        if (!Path.Exists(subdirectoryPath))
        {
            Directory.CreateDirectory(subdirectoryPath);
        }
        var filePath = $"{subdirectoryPath}/{file.FileName}";
        using var stream = File.Create(filePath);
        await file.CopyToAsync(stream);
    }
}
