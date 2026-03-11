namespace Click2Approve.WebApi.Exceptions;

public class ApprovalRequestCountExceededException(int maxRequests) : Exception(string.Format(DefaultMessage, maxRequests))
{
    private const string DefaultMessage = "The maximum number of approval requests {0} has been exceeded.";
}
