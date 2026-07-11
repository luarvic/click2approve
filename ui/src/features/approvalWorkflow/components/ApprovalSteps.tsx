import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { StackSpacing } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Divider, Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import ApprovalStepBlock from "./ApprovalStepBlock";

interface ApprovalStepsProps {
  approvalRequest: ApprovalRequest;
  showDividers?: boolean;
  sx?: SxProps<Theme>;
}

const getStepTasks = (
  approvalRequest: ApprovalRequest,
  step: ApprovalStep,
) => {
  const stepTasks = step.tasks?.filter(Boolean) ?? [];
  const stepTaskIds = new Set(stepTasks.map((task) => task.id));
  const requestStepTasks = (approvalRequest.tasks ?? [])
    .filter(Boolean)
    .filter(
      (task) =>
        task.approvalRequestStepId === step.id ||
        (stepTaskIds.size > 0 && stepTaskIds.has(task.id)),
    );
  return [...stepTasks, ...requestStepTasks].filter(
    (task, index, tasks) =>
      tasks.findIndex((item) => item.id === task.id) === index,
  );
};

const ApprovalSteps: React.FC<ApprovalStepsProps> = ({
  approvalRequest,
  showDividers = false,
  sx,
}) => {
  const steps = (approvalRequest.steps ?? [])
    .filter(Boolean)
    .sort((a, b) => a.sequence - b.sequence);

  return (
    <Stack
      spacing={StackSpacing.relaxed}
      divider={showDividers ? <Divider flexItem /> : undefined}
      sx={sx}
    >
      {steps.map((step) => (
        <ApprovalStepBlock
          key={step.id ?? step.sequence}
          step={step}
          tasks={getStepTasks(approvalRequest, step)}
        />
      ))}
    </Stack>
  );
};

export default ApprovalSteps;
