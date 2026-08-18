export const getApprovalRequestAssigneeVisibilityKey = (
  stepSequence: number,
  assigneeStepSequence: number,
  assigneeIndex: number,
) => `${stepSequence}:${assigneeStepSequence}:${assigneeIndex}`;
