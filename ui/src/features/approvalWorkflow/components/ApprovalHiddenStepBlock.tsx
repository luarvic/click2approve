import {
  ApprovalStatusLineSection,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import {
  ApprovalStep,
} from "@/features/approvalWorkflow/models/approvalStep";
import {
  Dialogs,
  Flex,
  Icons,
  StackSpacing,
} from "@/shared/constants/constants";
import { VisibilityOff } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Box,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState } from "react";

interface ApprovalHiddenStepBlockProps {
  step: ApprovalStep;
}

const approvalHiddenStepBlockSx: SxProps<Theme> = {
  px: Dialogs.stepStackSpacing,
  py: 0,
};

const stepHeaderActionsSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  ml: Dialogs.stepHeaderSpacing,
};
const visibilityPopoverSx: SxProps<Theme> = {
  maxWidth: 320,
  p: 2,
};

const getHiddenApproverLabels = (step: ApprovalStep) => {
  return (step.visibility ?? [])
    .filter((visibility) => visibility.isVisible === false)
    .map((visibility) =>
      visibility.approverDisplayName ??
      visibility.approverEmail ??
      "Approver",
    )
    .filter((label): label is string => Boolean(label));
};

const renderVisibilitySummary = (hiddenApproverLabels: string[]) => {
  if (hiddenApproverLabels.length === 0) {
    return "This step is hidden from you.";
  }

  return (
    <Stack spacing={StackSpacing.tight}>
      <Typography variant="body2">
        Hidden from:
      </Typography>
      {hiddenApproverLabels.map((label) => (
        <Typography key={label} variant="body2" color="text.secondary">
          {label}
        </Typography>
      ))}
    </Stack>
  );
};

const ApprovalHiddenStepBlock: React.FC<ApprovalHiddenStepBlockProps> = ({
  step,
}) => {
  const [visibilityAnchor, setVisibilityAnchor] = useState<HTMLElement | null>(null);
  const hiddenApproverLabels = getHiddenApproverLabels(step);

  return (
    <ApprovalStatusLineSection
      color="other"
      label="Hidden"
      lineVariant="dotted"
      sx={approvalHiddenStepBlockSx}
    >
      <Stack
        direction="row"
        spacing={Dialogs.stepHeaderSpacing}
        alignItems="center"
      >
        <Stack
          direction="row"
          spacing={StackSpacing.tight}
          alignItems="center"
          sx={Flex.growSx}
        >
          <Typography variant="subtitle2">
            Step {step.sequence}
          </Typography>
          <Box sx={stepHeaderActionsSx}>
            <Tooltip title="Step visibility">
              <IconButton
                aria-label={`Step ${step.sequence} visibility`}
                size="small"
                onClick={(event) => setVisibilityAnchor(event.currentTarget)}
              >
                <VisibilityOff color={Icons.secondaryColor} fontSize="small" />
              </IconButton>
            </Tooltip>
            <Popover
              open={Boolean(visibilityAnchor)}
              anchorEl={visibilityAnchor}
              onClose={() => setVisibilityAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              <Box sx={visibilityPopoverSx}>
                {renderVisibilitySummary(hiddenApproverLabels)}
              </Box>
            </Popover>
          </Box>
        </Stack>
      </Stack>
    </ApprovalStatusLineSection>
  );
};

export default ApprovalHiddenStepBlock;
