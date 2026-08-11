import type { ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import { StackSpacing } from "@/shared/constants/constants";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import { ExpandMore } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Accordion, AccordionDetails, AccordionSummary, Chip, Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface DiscussionParticipantsProps {
  assignees: ApprovalStepAssignee[];
  requesterDisplayName: string;
  requesterEmail: string;
}

const participantsBoxPadding = 1.5;

const participantsAccordionSx: SxProps<Theme> = (theme) => ({
  border: `2px dotted ${theme.palette.divider}`,
  borderRadius: 1,
  boxShadow: "none",
  "&::before": {
    display: "none",
  },
});

const participantsSummarySx: SxProps<Theme> = {
  px: participantsBoxPadding,
  "& .MuiAccordionSummary-content": {
    my: participantsBoxPadding,
  },
};

const participantsDetailsSx: SxProps<Theme> = {
  pb: participantsBoxPadding,
  pt: 0,
  px: participantsBoxPadding,
};

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
}) => {
  const participants = [
    {
      key: "requester",
      label: getParticipantLabel(
        requesterDisplayName,
        requesterEmail,
      ),
    },
    ...assignees.map((assignee, index) => ({
      key: assignee.globalId ?? `${assignee.type}-${assignee.email ?? assignee.displayName}-${index}`,
      label: getParticipantLabel(
        assignee.displayName,
        assignee.email,
      ),
    })),
  ]
    .filter(
      (participant, index, all) =>
        all.findIndex((candidate) => candidate.label === participant.label) === index,
    )
    .sort((first, second) => first.label.localeCompare(second.label));

  return (
    <Accordion disableGutters sx={participantsAccordionSx}>
      <AccordionSummary expandIcon={<ExpandMore />} sx={participantsSummarySx}>
        <Typography variant="subtitle2">Participants</Typography>
      </AccordionSummary>
      <AccordionDetails sx={participantsDetailsSx}>
        <Stack direction="row" flexWrap="wrap" spacing={StackSpacing.default} useFlexGap>
          {participants.map((participant) => (
            <Chip key={participant.key} label={participant.label} size="small" />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default DiscussionParticipants;
