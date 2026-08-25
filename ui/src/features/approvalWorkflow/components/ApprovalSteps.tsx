import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import SuccessSnackbarIcon from "@/shared/components/icons/SuccessSnackbarIcon";
import { Dialogs, Icons } from "@/shared/constants/constants";
import {
  BlockOutlined,
  CancelOutlined,
  DoNotDisturbOnOutlined,
  HourglassTop,
  PendingOutlined,
  VisibilityOffOutlined,
} from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Stack, Step, StepContent, StepLabel, Stepper } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import ApprovalStepTitle from "./ApprovalStepTitle";
import ApprovalStepBlock, { ApprovalStepMetadata } from "./ApprovalStepBlock";
import { getApprovalStepStatus } from "@/features/approvalWorkflow/utils/approvalStepStatus";

interface ApprovalStepsProps {
  approvalRequest: ApprovalRequest;
  collapseCards?: boolean;
  highlightedTaskGlobalId?: string;
  leadingItem?: ReactNode;
  limitWorkflowFields?: boolean;
  onHighlightedTaskClick?: () => void;
  showVisibleStepVisibility?: boolean;
  sx?: SxProps<Theme>;
  taskAttachmentsTenantGlobalId?: string;
}

const getStepTasks = (step: ApprovalStep) => {
  return (step.tasks ?? [])
    .filter(Boolean)
    .filter((task, index, tasks) => tasks.findIndex((item) => item.globalId === task.globalId) === index);
};

const getActiveStepIndex = (steps: ApprovalStep[]) => {
  const activeStepIndex = steps.findIndex((step) =>
    getStepTasks(step).some((task) => task.status === ApprovalRequestTaskStatus.Pending),
  );
  return activeStepIndex === -1 ? steps.length : activeStepIndex;
};

const stepIsCompleted = (status: string) =>
  status === "Completed successfully" || status === "Skipped" || status === "Canceled";

const stepHasError = (status: string) => status === "Completed unsuccessfully";

const stepContentSx: SxProps<Theme> = {
  pr: 0,
};

const getStepIcon = (status: string) => {
  switch (status) {
    case "Completed successfully":
      return <SuccessSnackbarIcon color="success" />;
    case "Completed unsuccessfully":
      return <CancelOutlined color="error" />;
    case "Skipped":
      return <DoNotDisturbOnOutlined color="warning" />;
    case "Canceled":
      return <BlockOutlined color="warning" />;
    case "Pending":
      return <HourglassTop color="primary" />;
    default:
      return <PendingOutlined color={Icons.secondaryColor} />;
  }
};

const HiddenStepIcon = () => <VisibilityOffOutlined color={Icons.secondaryColor} data-testid="hidden-step-icon" />;

const ApprovalSteps: React.FC<ApprovalStepsProps> = ({
  approvalRequest,
  collapseCards = false,
  highlightedTaskGlobalId,
  leadingItem,
  limitWorkflowFields = false,
  onHighlightedTaskClick,
  showVisibleStepVisibility = true,
  sx,
  taskAttachmentsTenantGlobalId,
}) => {
  const steps = (approvalRequest.steps ?? []).filter(Boolean).sort((a, b) => a.sequence - b.sequence);
  const activeStepIndex = getActiveStepIndex(steps);

  return (
    <Stack spacing={Dialogs.stepStackSpacing} sx={sx}>
      {leadingItem}
      <Stepper activeStep={activeStepIndex} nonLinear orientation="vertical">
        {steps.map((step) => {
          const tasks = getStepTasks(step);
          const stepStatus = getApprovalStepStatus(step, tasks);
          const stepIcon = () => getStepIcon(stepStatus);

          if (step.isVisible === false) {
            return (
              <Step key={step.globalId ?? step.sequence} completed={stepIsCompleted(stepStatus)}>
                <StepLabel error={stepHasError(stepStatus)} StepIconComponent={HiddenStepIcon}>
                  <ApprovalStepTitle sequence={step.sequence} />
                </StepLabel>
              </Step>
            );
          }

          return (
            <Step key={step.globalId ?? step.sequence} completed={stepIsCompleted(stepStatus)}>
              <StepLabel error={stepHasError(stepStatus)} StepIconComponent={stepIcon}>
                <ApprovalStepTitle sequence={step.sequence} />
              </StepLabel>
              <StepContent sx={stepContentSx} TransitionProps={{ in: true, unmountOnExit: false }}>
                <Stack spacing={Dialogs.stepHeaderSpacing}>
                  <ApprovalStepMetadata showVisibility={showVisibleStepVisibility} step={step} />
                  <ApprovalStepBlock
                    collapseCards={collapseCards}
                    highlightedTaskGlobalId={highlightedTaskGlobalId}
                    limitWorkflowFields={limitWorkflowFields}
                    onHighlightedTaskClick={onHighlightedTaskClick}
                    showMetadata={false}
                    showStepBox={false}
                    showStepTitle={false}
                    step={step}
                    taskAttachmentsTenantGlobalId={taskAttachmentsTenantGlobalId}
                    tasks={tasks}
                  />
                </Stack>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </Stack>
  );
};

export default ApprovalSteps;
