namespace Click2Approve.Domain.Exceptions;

/// <summary>
/// Represents an error raised when an operation exceeds an allowed limit.
/// </summary>
public class LimitExceededException(string message) : BusinessRuleException(message);
