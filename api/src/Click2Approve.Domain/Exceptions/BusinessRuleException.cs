namespace Click2Approve.Domain.Exceptions;

/// <summary>
/// Represents a business rule validation failure.
/// </summary>
public class BusinessRuleException(string message) : BaseException(message);
