namespace Click2Approve.WebApi.Exceptions;

public class TaskAlreadyCompletedException() : BaseException(DefaultMessage)
{
    private const string DefaultMessage = "The task has already been completed.";
}
