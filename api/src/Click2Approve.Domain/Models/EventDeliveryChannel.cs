namespace Click2Approve.Domain.Models;

/// <summary>
/// Identifies a client that receives a domain event.
/// </summary>
public enum EventDeliveryChannel
{
    Email = 0,
    InApp = 1
}
