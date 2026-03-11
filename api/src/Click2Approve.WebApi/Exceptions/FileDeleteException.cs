namespace Click2Approve.WebApi.Exceptions;

public class FileDeleteException(string path, Exception innerException)
    : Exception(string.Format(DefaultMessage, path), innerException)
{
    private const string DefaultMessage = "Failed to delete file at path: {0}.";
}
