import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import ApprovalStepList from "@/features/approvalWorkflow/components/ApprovalStepList";
import ApprovalStepSection from "@/features/approvalWorkflow/components/ApprovalStepSection";
import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { getApprovalStepStatus } from "@/features/approvalWorkflow/utils/approvalStepStatus";
import SuccessSnackbarIcon from "@/shared/components/icons/SuccessSnackbarIcon";
import { Icons } from "@/shared/components/icons/iconStyles";
import {
  BlockOutlined,
  CancelOutlined,
  DoNotDisturbOnOutlined,
  HourglassTop,
  PendingOutlined,
  VisibilityOffOutlined,
} from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import ApprovalStepBlock, { ApprovalStepMetadata } from "./ApprovalStepBlock";

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

const workflowSpacing = 3;
const getStepIcon = (status: string) => {
  switch (status) {
    case "Succeeded":
      return <SuccessSnackbarIcon color="success" />;
    case "Failed":
      return <CancelOutlined color="error" />;
    case "Skipped":
      return <DoNotDisturbOnOutlined color="warning" />;
    case "Canceled":
      return <BlockOutlined color="warning" />;
    case "Pending":
      return <HourglassTop color="disabled" />;
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

  return (
    <Stack spacing={workflowSpacing} sx={sx}>
      {leadingItem}
      <ApprovalStepList>
        {steps.map((step) => {
          const tasks = getStepTasks(step);
          const stepStatus = getApprovalStepStatus(step, tasks);
          const isHidden = step.isVisible === false;

          return (
            <ApprovalStepSection
              key={step.globalId ?? step.sequence}
              icon={isHidden ? <HiddenStepIcon /> : getStepIcon(stepStatus)}
              iconLabel={isHidden ? "Hidden step" : stepStatus}
              sequence={step.sequence}
            >
              {!isHidden && (
                <>
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
                </>
              )}
            </ApprovalStepSection>
          );
        })}
      </ApprovalStepList>
    </Stack>
  );
};

export default ApprovalSteps;
