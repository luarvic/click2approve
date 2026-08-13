namespace Click2Approve.Domain.Models;

/// <summary>
/// Defines which request participants can view an approval workflow step.
/// </summary>
public enum ApprovalStepVisibilityMode
{
    AllParticipants = 0,
    AllParticipantsExceptSelected = 1,
    AssigneesAndSelectedParticipants = 2,
    AssigneesOnly = 3
}
