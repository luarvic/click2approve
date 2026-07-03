namespace Click2Approve.Domain.Exceptions;

public class FileDeleteException(string path, Exception innerException)
    : BaseException(string.Format(DefaultMessage, path), innerException)
{
    private const string DefaultMessage = "Failed to delete file at path: {0}.";
}
