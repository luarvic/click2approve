namespace Click2Approve.Domain.Exceptions;

public class LimitExceededException(string message) : BusinessRuleException(message);
