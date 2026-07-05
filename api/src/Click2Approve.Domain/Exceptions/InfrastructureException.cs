namespace Click2Approve.Domain.Exceptions;

public class InfrastructureException(string message, Exception? innerException = null) : BaseException(message, innerException);
