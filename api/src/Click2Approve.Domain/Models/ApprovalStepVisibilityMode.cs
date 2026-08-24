namespace Click2Approve.Domain.Models;

/// <summary>
/// Defines which request participants can view an approval workflow step.
/// </summary>
public enum ApprovalStepVisibilityMode
{
    AllParticipants = 0,
    OrganizationEmployees = 1,
    AssigneesOnly = 2
}
