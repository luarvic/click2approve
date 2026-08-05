namespace Click2Approve.Application.Models.Auxiliary;

/// <summary>
/// Represents an uploaded file passed into application services.
/// </summary>
public sealed record UploadedFile(string FileName, string ContentType, long Length, byte[] Bytes);
