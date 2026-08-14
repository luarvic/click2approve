import { ApprovalStep, ApprovalStepVisibilityMode } from "@/features/approvalWorkflow/models/approvalStep";
import { StackSpacing } from "@/shared/constants/constants";
import { Link, Stack, Typography } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState } from "react";

interface ApprovalStepVisibilitySummaryProps {
  step: ApprovalStep;
}

const maximumVisibleParticipants = 2;
const participantSeparator = " · ";
const visibilityExceptionsSx: SxProps<Theme> = {
  alignItems: "center",
  flexWrap: "wrap",
  gap: StackSpacing.tight,
  minWidth: 0,
};
const moreLinkSx: SxProps<Theme> = { ml: StackSpacing.tight };

const getVisibilityParticipants = (step: ApprovalStep, mode: ApprovalStepVisibilityMode) => {
  const assigneeGlobalIds = new Set(step.assignees.map((assignee) => assignee.globalId));
  const isVisible = mode === ApprovalStepVisibilityMode.AssigneesAndSelectedParticipants;

  return (step.visibility ?? [])
    .filter((visibility) => !assigneeGlobalIds.has(visibility.assigneeGlobalId) && visibility.isVisible === isVisible)
    .map((visibility) => visibility.assigneeDisplayName ?? visibility.assigneeEmail ?? "Assignee");
};

const ApprovalStepVisibilitySummary: React.FC<ApprovalStepVisibilitySummaryProps> = ({ step }) => {
  const [participantsAreExpanded, setParticipantsAreExpanded] = useState(false);
  const mode = step.visibilityMode ?? ApprovalStepVisibilityMode.AllParticipants;
  const participants = getVisibilityParticipants(step, mode);
  const label = mode === ApprovalStepVisibilityMode.AllParticipantsExceptSelected ? "Hidden from" : "Also visible to";

  if (
    mode === ApprovalStepVisibilityMode.AllParticipants ||
    mode === ApprovalStepVisibilityMode.AssigneesOnly ||
    participants.length === 0
  ) {
    return null;
  }

  const displayedParticipants = participantsAreExpanded
    ? participants
    : participants.slice(0, maximumVisibleParticipants);
  const remainingParticipantCount = participants.length - displayedParticipants.length;

  return (
    <Stack aria-label={`Step ${step.sequence} visibility ${label}`} direction="row" sx={visibilityExceptionsSx}>
      <Typography color="text.secondary" variant="caption">
        {label} {displayedParticipants.join(participantSeparator)}
        {remainingParticipantCount > 0 && (
          <Link
            component="button"
            onClick={() => setParticipantsAreExpanded(true)}
            sx={moreLinkSx}
            type="button"
            variant="caption"
          >
            +{remainingParticipantCount} more
          </Link>
        )}
      </Typography>
    </Stack>
  );
};

export default ApprovalStepVisibilitySummary;
