namespace Click2Approve.Domain.Exceptions;

public class FileSizeLimitExceededException(int maxFileSizeBytes) : BaseException(string.Format(DefaultMessage, maxFileSizeBytes))
{
    private const string DefaultMessage = "The maximum file size ({0} bytes) has been exceeded.";
}
