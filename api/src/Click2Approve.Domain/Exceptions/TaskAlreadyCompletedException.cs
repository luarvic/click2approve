namespace Click2Approve.Domain.Exceptions;

public class TaskAlreadyCompletedException() : BaseException(DefaultMessage)
{
    private const string DefaultMessage = "The task has already been completed.";
}
