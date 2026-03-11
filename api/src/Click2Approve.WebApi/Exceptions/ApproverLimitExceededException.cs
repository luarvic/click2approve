namespace Click2Approve.WebApi.Exceptions;

public class ApproverLimitExceededException(int maxApprovers) : Exception(string.Format(DefaultMessage, maxApprovers))
{
    private const string DefaultMessage = "The maximum number of approvers ({0}) has been exceeded.";
}
