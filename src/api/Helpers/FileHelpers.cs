namespace api.Helpers;

// A set of static helpers for I/O operations with files.
public static class FileHelpers
{
    public static async Task SaveFileAsync(IFormFile file, string directory)
    {
        if (!Path.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }
        var filePath = Path.Combine(directory, file.FileName);
        using var stream = File.Create(filePath);
        await file.CopyToAsync(stream);
    }
}
