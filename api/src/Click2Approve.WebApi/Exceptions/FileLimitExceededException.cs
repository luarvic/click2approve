namespace Click2Approve.WebApi.Exceptions;

public class FileLimitExceededException(int maxFiles) : Exception(string.Format(DefaultMessage, maxFiles))
{
    private const string DefaultMessage = "The maximum number of files ({0}) has been exceeded.";
}
