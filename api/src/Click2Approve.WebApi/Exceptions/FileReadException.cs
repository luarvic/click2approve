namespace Click2Approve.WebApi.Exceptions;

public class FileReadException(string path, Exception innerException)
    : Exception(string.Format(DefaultMessage, path), innerException)
{
    private const string DefaultMessage = "Failed to read file at path: {0}.";
}
