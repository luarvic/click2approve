namespace Click2Approve.WebApi.Exceptions;

public class FileCreateException(string path, Exception innerException)
    : BaseException(string.Format(DefaultMessage, path), innerException)
{
    private const string DefaultMessage = "Failed to create file at path: {0}.";
}
