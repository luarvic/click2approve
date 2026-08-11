import { AssigneeType, type ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import { StackSpacing } from "@/shared/constants/constants";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import { ExpandMore } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Accordion, AccordionDetails, AccordionSummary, Chip, Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

interface DiscussionParticipantsProps {
  assignees: ApprovalStepAssignee[];
  requesterDisplayName: string;
  requesterEmail: string;
}

const participantsBoxPadding = 1.5;

const participantsAccordionSx: SxProps<Theme> = (theme) => ({
  backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
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
  type: AssigneeType,
  displayName?: string,
  email?: string,
): string => {
  const name = stripInlineEmail(displayName);
  return type === AssigneeType.Email ? (email ?? name) || "Unknown user" : name || email || "Unknown user";
};


const DiscussionParticipants: React.FC<DiscussionParticipantsProps> = ({
  assignees,
  requesterDisplayName,
  requesterEmail,
}) => {
  const participants = [
    {
      key: "requester",
      label: getParticipantLabel(AssigneeType.Employee, requesterDisplayName, requesterEmail),
    },
    ...assignees.map((assignee, index) => ({
      key: assignee.globalId ?? `${assignee.type}-${assignee.email ?? assignee.displayName}-${index}`,
      label: getParticipantLabel(assignee.type, assignee.displayName, assignee.email),
    })),
  ].sort((first, second) => first.label.localeCompare(second.label));

  return (
    <Accordion disableGutters sx={participantsAccordionSx}>
      <AccordionSummary expandIcon={<ExpandMore />} sx={participantsSummarySx}>
        <Typography variant="subtitle2">Chat participants</Typography>
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
