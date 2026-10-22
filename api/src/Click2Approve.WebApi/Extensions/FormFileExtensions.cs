using Click2Approve.Application.Models.Files;
using Click2Approve.Domain.Validation;

namespace Click2Approve.WebApi.Extensions;

/// <summary>
/// Extends ASP.NET Core form file types.
/// </summary>
public static class FormFileExtensions
{
    /// <summary>
    /// Converts an ASP.NET Core form file to an application uploaded file.
    /// </summary>
    public static async Task<UploadedFile> ToUploadedFileAsync(this IFormFile formFile, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(formFile.FileName) || formFile.FileName.Length > FieldLimits.Name)
            throw new FluentValidation.ValidationException([
                new FluentValidation.Results.ValidationFailure("File", $"Filename must contain between 1 and {FieldLimits.Name} characters.")]);
        using var stream = new MemoryStream();
        await formFile.CopyToAsync(stream, cancellationToken);
        return new UploadedFile(
            formFile.FileName,
            formFile.ContentType,
            formFile.Length,
            stream.ToArray());
    }

    /// <summary>
    /// Converts an ASP.NET Core form file collection to application uploaded files.
    /// </summary>
    public static async Task<IReadOnlyCollection<UploadedFile>> ToUploadedFilesAsync(
        this IFormFileCollection formFiles,
        CancellationToken cancellationToken)
    {
        var uploadedFiles = new List<UploadedFile>();
        foreach (var formFile in formFiles)
        {
            uploadedFiles.Add(await formFile.ToUploadedFileAsync(cancellationToken));
        }

        return uploadedFiles;
    }
}
