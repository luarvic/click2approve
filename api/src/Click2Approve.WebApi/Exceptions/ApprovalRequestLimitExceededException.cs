namespace Click2Approve.WebApi.Exceptions;

public class ApprovalRequestLimitExceededException(int maxRequests) : Exception(string.Format(DefaultMessage, maxRequests))
{
    private const string DefaultMessage = "The maximum number of approval requests per day ({0}) has been exceeded.";
}
