namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Identifies the account email template to deliver.
/// </summary>
public enum AccountEmailType
{
    EmailConfirmation = 0,
    PasswordReset = 1,
    EmployeeInvitation = 2,
    EmailChangeConfirmation = 3
}
