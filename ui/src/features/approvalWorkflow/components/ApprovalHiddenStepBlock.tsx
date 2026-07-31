import {
  ApprovalStep,
} from "@/features/approvalWorkflow/models/approvalStep";
import {
  Dialogs,
  Flex,
  StackSpacing,
} from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import ApprovalStepVisibilitySummary from "./ApprovalStepVisibilitySummary";

interface ApprovalHiddenStepBlockProps {
  step: ApprovalStep;
}

const stepTitleRowSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: StackSpacing.tight,
};

const ApprovalHiddenStepBlock: React.FC<ApprovalHiddenStepBlockProps> = ({
  step,
}) => {
  return (
    <Box aria-label="Hidden" sx={Dialogs.approvalBoxSx}>
      <Stack
        direction="row"
        spacing={Dialogs.stepHeaderSpacing}
        alignItems="center"
      >
        <Stack
          direction="row"
          spacing={StackSpacing.tight}
          sx={Flex.growSx}
        >
          <Stack
            direction="row"
            sx={stepTitleRowSx}
          >
            <Typography variant="subtitle2">
              Step {step.sequence}
            </Typography>
            <ApprovalStepVisibilitySummary
              emptyMessage="Hidden from you"
              inline
              step={step}
            />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ApprovalHiddenStepBlock;
