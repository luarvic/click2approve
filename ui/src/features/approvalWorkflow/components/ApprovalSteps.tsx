import { approvalStepIconSx } from "@/features/approvalWorkflow/components/approvalStepStyles";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import ApprovalStepDetails from "@/features/approvalWorkflow/components/ApprovalStepDetails";
import ApprovalStepList from "@/features/approvalWorkflow/components/ApprovalStepList";
import ApprovalStepSection from "@/features/approvalWorkflow/components/ApprovalStepSection";
import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { VisibilityOffOutlined } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import ApprovalStepBlock from "./ApprovalStepBlock";

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
const HiddenStepIcon = () => <VisibilityOffOutlined sx={approvalStepIconSx} data-testid="hidden-step-icon" />;

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
          const isHidden = step.isVisible === false;

          return (
            <ApprovalStepSection
              key={step.globalId ?? step.sequence}
              icon={isHidden ? <HiddenStepIcon /> : undefined}
              iconLabel={isHidden ? "Hidden step" : undefined}
              sequence={step.sequence}
              actionLabel={
                isHidden
                  ? undefined
                  : getApprovalRequestTaskActionLabels(step.action ?? ApprovalRequestTaskAction.Approve).positive
              }
              expandedDetails={
                isHidden ? undefined : (
                  <ApprovalStepDetails
                    attributes={showVisibleStepVisibility ? undefined : ["completion", "requirements", "assignees"]}
                    step={step}
                  />
                )
              }
            >
              {!isHidden && (
                <>
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
