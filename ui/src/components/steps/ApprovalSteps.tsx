import {
  Box,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  SxProps,
} from "@mui/material";
import { IApprovalRequest } from "../../models/approvalRequest";
import { ApprovalStatus } from "../../models/approvalStatus";
import { getLocaleDateTimeString } from "../../utils/converters";
import CommentPaper from "../papers/CommentPaper";

interface IApprovalStepsProps {
  approvalRequest: IApprovalRequest;
  sx?: SxProps;
}

const ApprovalSteps: React.FC<IApprovalStepsProps> = ({
  approvalRequest,
  sx,
}) => {
  let steps: JSX.Element[] = [];
  const completedTasks = approvalRequest.tasks.filter((t) => t.completed);
  completedTasks.sort(
    (a, b) => b.completedDate!.getDate() - a.completedDate!.getDate()
  );
  steps = steps.concat(
    completedTasks.map((task, index) => (
      <Step key={`completedTask${index}`} active={true}>
        <StepLabel error={task.status === ApprovalStatus.Rejected}>
          {ApprovalStatus[task.status]} by {task.approver.toLowerCase()}
        </StepLabel>
        {task.completedDate && (
          <StepContent>
            {`on ${getLocaleDateTimeString(task.completedDate)}`}
            <CommentPaper text={task.comment} sx={{ mt: 1 }} />
          </StepContent>
        )}
      </Step>
    ))
  );
  const uncompletedTasks = approvalRequest.tasks.filter((t) => !t.completed);
  steps = steps.concat(
    uncompletedTasks.map((task, index) => (
      <Step key={`uncompletedTask${index}`} active={false}>
        <StepLabel>
          Requested approval from {task.approver.toLowerCase()}
        </StepLabel>
      </Step>
    ))
  );

  return (
    <Box sx={{ ...sx }}>
      <Stepper orientation="vertical" activeStep={completedTasks.length}>
        {steps}
      </Stepper>
    </Box>
  );
};

export default ApprovalSteps;
