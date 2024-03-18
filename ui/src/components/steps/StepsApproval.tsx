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
import { IApprovalRequest } from "../../models/ApprovalRequest";
import { ApprovalStatus } from "../../models/ApprovalStatus";
import { getLocaleDateTimeString } from "../../utils/Converters";

interface IStepsApprovalProps {
  approvalRequest: IApprovalRequest;
  sx?: SxProps;
}

export const StepsApproval: React.FC<IStepsApprovalProps> = ({
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
              {(comment.split(/\r?\n/) as string[]).map((line) => (
                <Box>{line}</Box>
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
    completedTasks.map((task) => (
      <Step active={true}>
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
    uncompletedTasks.map((task) => (
      <Step active={false}>
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
