import ApprovalStepAssignees from "@/features/approvalWorkflow/components/ApprovalStepAssignees";
import { AssigneeType, type ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";

interface DiscussionParticipantsProps {
  assignees: ApprovalStepAssignee[];
  requesterDisplayName: string;
  requesterEmail: string;
  requesterType: AssigneeType;
}

const getParticipantLabel = (displayName?: string, email?: string): string => {
  const name = stripInlineEmail(displayName);
  return name || email || "Unknown user";
};

const DiscussionParticipants: React.FC<DiscussionParticipantsProps> = ({
  assignees,
  requesterDisplayName,
  requesterEmail,
  requesterType,
}) => {
  const participants = [
    {
      key: "requester",
      label: getParticipantLabel(requesterDisplayName, requesterEmail),
      type: requesterType,
    },
    ...assignees.map((assignee, index) => ({
      key: assignee.globalId ?? `${assignee.type}-${assignee.email ?? assignee.displayName}-${index}`,
      label: getParticipantLabel(assignee.displayName, assignee.email),
      type: assignee.type,
    })),
  ]
    .filter((participant, index, all) => all.findIndex((candidate) => candidate.label === participant.label) === index)
    .sort((first, second) => first.label.localeCompare(second.label));

  return (
    <ApprovalStepAssignees
      label="Participants"
      assignees={participants.map((participant) => ({
        globalId: participant.key,
        displayName: participant.label,
        type: participant.type,
      }))}
    />
  );
};

export default DiscussionParticipants;
