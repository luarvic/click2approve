namespace Click2Approve.Domain.Exceptions;

/// <summary>
/// Represents an error raised when a requested resource cannot be found.
/// </summary>
public class NotFoundException(string message) : BaseException(message);
