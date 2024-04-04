import {
  Box,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  SxProps,
  Typography,
} from "@mui/material";
import { IApprovalRequest } from "../../models/approvalRequest";
import { ApprovalStatus } from "../../models/approvalStatus";
import { getLocaleDateTimeString } from "../../utils/converters";

interface IApprovalStepsProps {
  approvalRequest: IApprovalRequest;
  sx?: SxProps;
}

const ApprovalSteps: React.FC<IApprovalStepsProps> = ({
  approvalRequest,
  sx,
}) => {
  const renderComment = (comment: string | undefined) => {
    return (
      <Box>
        {comment && (
          <Box>
            <Typography>with comment:</Typography>
            <Paper sx={{ p: 1, mt: 1 }} elevation={3}>
              {(comment.split(/\r?\n/) as string[]).map((line, index) => (
                <Box key={index}>{line}</Box>
              ))}
            </Paper>
          </Box>
        )}
      </Box>
    );
  };

  let steps: JSX.Element[] = [];
  const completedTasks = approvalRequest.tasks.filter((t) => t.completed);
  completedTasks.sort(
    (a, b) => b.completedDate!.getDate() - a.completedDate!.getDate()
  );
  steps = steps.concat(
    completedTasks.map((task, index) => (
      <Step key={index} active={true}>
        <StepLabel error={task.status === ApprovalStatus.Rejected}>
          {ApprovalStatus[task.status]} by {task.approver.toLowerCase()}
        </StepLabel>
        {task.completedDate && (
          <StepContent>
            <Typography>{`on ${getLocaleDateTimeString(
              task.completedDate
            )}`}</Typography>
            {renderComment(task.comment)}
          </StepContent>
        )}
      </Step>
    ))
  );
  const uncompletedTasks = approvalRequest.tasks.filter((t) => !t.completed);
  steps = steps.concat(
    uncompletedTasks.map((task, index) => (
      <Step key={index} active={false}>
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
