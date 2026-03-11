namespace Click2Approve.WebApi.Exceptions;

public class FileSizeExceededException(int maxFileSizeBytes) : Exception(string.Format(DefaultMessage, maxFileSizeBytes))
{
    private const string DefaultMessage = "The maximum file size {0} bytes has been exceeded.";
}
