import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import { AssigneeType, type ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import { Box, Stack } from "@mui/material";

interface DiscussionParticipantsProps {
  assignees: ApprovalStepAssignee[];
  requesterDisplayName: string;
  requesterEmail: string;
  requesterType: AssigneeType;
}

const participantListSx = {
  columnGap: 2,
  flexWrap: "wrap",
  listStyle: "none",
  m: 0,
  px: 0,
  pb: 1,
  rowGap: 1,
} as const;
const participantItemSx = { maxWidth: "100%", minWidth: 0 } as const;

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
    <Stack component="ul" aria-label="Participants" direction="row" sx={participantListSx}>
      {participants.map((participant) => (
        <Box component="li" key={participant.key} sx={participantItemSx}>
          <ApprovalRequestParticipant
            allowDisplayNameWrap
            displayName={participant.label}
            type={participant.type}
            variant="body1"
          />
        </Box>
      ))}
    </Stack>
  );
};

export default DiscussionParticipants;
