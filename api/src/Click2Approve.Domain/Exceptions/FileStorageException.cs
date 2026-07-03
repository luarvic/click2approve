namespace Click2Approve.Domain.Exceptions;

public class FileStorageException() : BaseException(DefaultMessage)
{
    private const string DefaultMessage = "File storage configuration is invalid.";
}
