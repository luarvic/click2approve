namespace Click2Approve.WebApi.Exceptions;

/// <summary>
/// The base class for all exceptions in the application.
/// </summary>
/// <param name="message">The error message.</param>
/// <param name="innerException">The inner exception.</param>
public abstract class BaseException(string message, Exception? innerException = null)
    : Exception(message, innerException);
