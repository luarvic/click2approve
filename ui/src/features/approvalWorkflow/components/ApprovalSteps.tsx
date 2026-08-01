import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { Dialogs } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Divider, Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import ApprovalHiddenStepBlock from "./ApprovalHiddenStepBlock";
import ApprovalStepBlock from "./ApprovalStepBlock";

interface ApprovalStepsProps {
  approvalRequest: ApprovalRequest;
  highlightedTaskGlobalId?: string;
  leadingItem?: ReactNode;
  onHighlightedTaskClick?: () => void;
  showVisibleStepVisibility?: boolean;
  showDividers?: boolean;
  sx?: SxProps<Theme>;
}

const getStepTasks = (
  step: ApprovalStep,
) => {
  return (step.tasks ?? []).filter(Boolean).filter(
    (task, index, tasks) =>
      tasks.findIndex((item) => item.globalId === task.globalId) === index,
  );
};

const ApprovalSteps: React.FC<ApprovalStepsProps> = ({
  approvalRequest,
  highlightedTaskGlobalId,
  leadingItem,
  onHighlightedTaskClick,
  showVisibleStepVisibility = true,
  showDividers = false,
  sx,
}) => {
  const steps = (approvalRequest.steps ?? [])
    .filter(Boolean)
    .sort((a, b) => a.sequence - b.sequence);

  return (
    <Stack
      spacing={Dialogs.stepStackSpacing}
      divider={showDividers ? <Divider flexItem /> : undefined}
      sx={sx}
    >
      {leadingItem}
      {steps.map((step) => {
        if (step.isVisible === false) {
          return (
            <ApprovalHiddenStepBlock
              key={step.globalId ?? step.sequence}
              step={step}
            />
          );
        }

        return (
          <ApprovalStepBlock
            key={step.globalId ?? step.sequence}
            highlightedTaskGlobalId={highlightedTaskGlobalId}
            onHighlightedTaskClick={onHighlightedTaskClick}
            showVisibility={showVisibleStepVisibility}
            step={step}
            tasks={getStepTasks(step)}
          />
        );
      })}
    </Stack>
  );
};

export default ApprovalSteps;
