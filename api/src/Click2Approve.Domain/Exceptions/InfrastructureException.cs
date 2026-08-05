namespace Click2Approve.Domain.Exceptions;

/// <summary>
/// Represents an infrastructure-layer failure.
/// </summary>
public class InfrastructureException(string message, Exception? innerException = null) : BaseException(message, innerException);
