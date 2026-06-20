namespace Click2Approve.WebApi.Exceptions;

public class FileReadException(string path, Exception innerException)
    : BaseException(string.Format(DefaultMessage, path), innerException)
{
    private const string DefaultMessage = "Failed to read file at path: {0}.";
}
