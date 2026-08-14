import {
  AssigneeType,
  type ApprovalStepAssignee,
} from "@/features/approvalWorkflow/models/approvalStep";
import ApprovalRequestParticipantLabel from "@/features/approvalRequests/components/ApprovalRequestParticipantLabel";
import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import DisplayName from "@/shared/components/identity/DisplayName";
import { StackSpacing } from "@/shared/constants/constants";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import { Stack } from "@mui/material";

interface DiscussionParticipantsProps {
  assignees: ApprovalStepAssignee[];
  requesterDisplayName: string;
  requesterEmail: string;
  requesterType: AssigneeType;
}

const getParticipantLabel = (
  displayName?: string,
  email?: string,
): string => {
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
      label: getParticipantLabel(
        requesterDisplayName,
        requesterEmail,
      ),
      type: requesterType,
    },
    ...assignees.map((assignee, index) => ({
      key: assignee.globalId ?? `${assignee.type}-${assignee.email ?? assignee.displayName}-${index}`,
      label: getParticipantLabel(
        assignee.displayName,
        assignee.email,
      ),
      type: assignee.type,
    })),
  ]
    .filter(
      (participant, index, all) =>
        all.findIndex((candidate) => candidate.label === participant.label) === index,
    )
    .sort((first, second) => first.label.localeCompare(second.label));

  return (
    <Stack spacing={StackSpacing.default}>
      <ApprovalRequestParticipantLabel>
        {`Participants · ${participants.length}`}
      </ApprovalRequestParticipantLabel>
      <Stack
        direction="row"
        flexWrap="wrap"
        spacing={StackSpacing.default}
        useFlexGap
      >
        {participants.map((participant) => (
          <ApprovalRequestParticipantLine
            key={participant.key}
            label={(
              <DisplayName
                displayName={participant.label}
                showEmailAddress={false}
              />
            )}
            type={participant.type}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default DiscussionParticipants;
