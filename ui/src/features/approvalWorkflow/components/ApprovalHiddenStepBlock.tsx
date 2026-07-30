import {
  ApprovalStatusLineSection,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
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
  Stack,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import ApprovalStepVisibilitySummary from "./ApprovalStepVisibilitySummary";

interface ApprovalHiddenStepBlockProps {
  step: ApprovalStep;
}

const approvalHiddenStepBlockSx: SxProps<Theme> = {
  px: Dialogs.stepStackSpacing,
  py: 0,
};

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
    </ApprovalStatusLineSection>
  );
};

export default ApprovalHiddenStepBlock;
