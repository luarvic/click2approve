namespace Click2Approve.Domain.Exceptions;

public class ApprovalRequestLimitExceededException(int maxRequests) : BaseException(string.Format(DefaultMessage, maxRequests))
{
    private const string DefaultMessage = "The maximum number of approval requests per day ({0}) has been exceeded.";
}
