namespace Click2Approve.Application.Models.Emails;

/// <summary>Provides a supplementary plain-text link in a notification email.</summary>
public sealed record EmailLink(string Text, string Url);
