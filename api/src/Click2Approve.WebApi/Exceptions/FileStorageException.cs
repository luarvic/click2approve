namespace Click2Approve.WebApi.Exceptions;

public class FileStorageException() : BaseException(DefaultMessage)
{
    private const string DefaultMessage = "File storage configuration is invalid.";
}
