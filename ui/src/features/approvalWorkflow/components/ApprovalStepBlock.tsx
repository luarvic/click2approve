import ApprovalRequestTaskAttachmentList from "@/features/approvalRequests/components/ApprovalRequestTaskAttachmentList";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { ApprovalStepStyles } from "@/features/approvalWorkflow/components/approvalStepStyles";
import { ApprovalStep, ApprovalStepAssignee, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import {
  getApprovalStepBorderLeftColor,
  getApprovalStepStatus,
} from "@/features/approvalWorkflow/utils/approvalStepStatus";
import { StackSpacing } from "@/shared/theme/tokens";
import { Box, Stack, type SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import ApprovalStepDetails from "./ApprovalStepDetails";
import ApprovalStepHeader from "./ApprovalStepHeader";
import ApprovalUpcomingTaskBlock from "./ApprovalUpcomingTaskBlock";

interface ApprovalStepBlockProps {
  collapseCards?: boolean;
  contentSx?: SxProps<Theme>;
  footerContent?: ReactNode;
  headerAccessory?: ReactNode;
  highlightedTaskGlobalId?: string;
  limitWorkflowFields?: boolean;
  onHighlightedTaskClick?: () => void;
  showStepBox?: boolean;
  showMetadata?: boolean;
  showVisibility?: boolean;
  showStepTitle?: boolean;
  setupFutureTasks?: boolean;
  step: ApprovalStep;
  tasks: ApprovalRequestTask[];
  taskAttachmentsTenantGlobalId?: string;
}

const getAssigneeTasks = (assignee: ApprovalStep["assignees"][number], tasks: ApprovalRequestTask[]) =>
  tasks.filter((task) => task.approvalRequestStepAssigneeGlobalId === assignee.globalId);

const renderTaskDetails = (
  task: ApprovalRequestTask,
  assignee: ApprovalStepAssignee | undefined,
  isCurrentTask: boolean,
  collapseCards: boolean,
  limitWorkflowFields: boolean,
  stepperBorderLeftColor: string,
  onCurrentTaskClick?: () => void,
  taskAttachmentsTenantGlobalId?: string,
) => (
  <ApprovalRequestTaskSummaryBlock
    additionalMetadata={
      taskAttachmentsTenantGlobalId && task.taskFiles?.length ? (
        <ApprovalRequestTaskAttachmentList
          label="Files attached to this decision"
          taskFiles={task.taskFiles ?? []}
          taskGlobalId={task.globalId}
          tenantGlobalId={taskAttachmentsTenantGlobalId}
        />
      ) : undefined
    }
    key={task.globalId}
    defaultExpanded={isCurrentTask || !collapseCards}
    expandable
    assignedVia={assignee?.type === AssigneeType.Team ? assignee : undefined}
    onClick={isCurrentTask ? onCurrentTaskClick : undefined}
    numberColor={
      task.status === ApprovalRequestTaskStatus.Pending || task.status === ApprovalRequestTaskStatus.Completed
        ? "text.primary"
        : "text.secondary"
    }
    numberComponent="h3"
    numberVariant="h6"
    participant="assignee"
    participantType={
      task.isAssigneeEmployee || assignee?.type === AssigneeType.Team || assignee?.type === AssigneeType.Employee
        ? AssigneeType.Employee
        : AssigneeType.User
    }
    showComment
    showDescription={!limitWorkflowFields}
    showFiles={!limitWorkflowFields}
    showInstructionsLabel={false}
    showElectronicSignature
    showRevision={!limitWorkflowFields}
    stepperBorderLeftColor={task.status === ApprovalRequestTaskStatus.Pending ? stepperBorderLeftColor : undefined}
    showTitle={false}
    task={task}
    taskNumberPrefix="Task"
  />
);

const renderAssigneeWithoutTasks = (
  assignee: ApprovalStepAssignee,
  index: number,
  collapseCards: boolean,
  setupFutureTasks: boolean,
  instructions?: string,
) => (
  <ApprovalUpcomingTaskBlock
    key={assignee.globalId ?? index}
    assignee={assignee}
    compact={setupFutureTasks}
    defaultExpanded={!collapseCards}
    instructions={instructions}
    title={setupFutureTasks ? "Task setup" : undefined}
  />
);

const ApprovalStepBlock: React.FC<ApprovalStepBlockProps> = ({
  collapseCards = false,
  contentSx,
  footerContent,
  headerAccessory,
  highlightedTaskGlobalId,
  limitWorkflowFields = false,
  onHighlightedTaskClick,
  showStepBox = true,
  showMetadata = true,
  showVisibility = true,
  showStepTitle = true,
  setupFutureTasks = false,
  step,
  taskAttachmentsTenantGlobalId,
  tasks,
}) => {
  const assignees = (step.assignees ?? []).filter(Boolean);
  const stepStatus = getApprovalStepStatus(step, tasks);
  const stepperBorderLeftColor = getApprovalStepBorderLeftColor(stepStatus);
  const stepContent = (
    <Stack spacing={ApprovalStepStyles.stepStackSpacing}>
      {(showStepTitle || headerAccessory) && (
        <ApprovalStepHeader
          accessory={headerAccessory}
          hasBottomMargin
          sequence={step.sequence}
          showTitle={showStepTitle}
        />
      )}
      <Stack spacing={StackSpacing.loose} sx={contentSx}>
        {showMetadata && (
          <ApprovalStepDetails
            attributes={showVisibility ? undefined : ["completion", "requirements", "assignees"]}
            step={step}
          />
        )}
        {tasks.map((task) =>
          renderTaskDetails(
            task,
            assignees.find((assignee) => assignee.globalId === task.approvalRequestStepAssigneeGlobalId),
            task.globalId === highlightedTaskGlobalId,
            collapseCards,
            limitWorkflowFields,
            stepperBorderLeftColor,
            onHighlightedTaskClick,
            taskAttachmentsTenantGlobalId,
          ),
        )}
        {assignees.map((assignee, index) =>
          getAssigneeTasks(assignee, tasks).length === 0
            ? renderAssigneeWithoutTasks(assignee, index, collapseCards, setupFutureTasks, step.instructions)
            : null,
        )}
      </Stack>
      {footerContent}
    </Stack>
  );

  return showStepBox ? (
    <Box aria-label={stepStatus} sx={ApprovalStepStyles.approvalBoxSx}>
      {stepContent}
    </Box>
  ) : (
    stepContent
  );
};

export default ApprovalStepBlock;
