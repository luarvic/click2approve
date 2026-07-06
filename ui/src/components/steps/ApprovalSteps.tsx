import {
  Box,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { DIALOG_SECTION_SX } from "../../data/constants";
import { IApprovalRequest } from "../../models/approvalRequest";
import { ApprovalStatus } from "../../models/approvalStatus";
import { getLocaleDateTimeString } from "../../utils/helpers";
import CommentPaper from "../papers/CommentPaper";

interface IApprovalStepsProps {
  approvalRequest: IApprovalRequest;
  sx?: SxProps<Theme>;
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
          {task.approver.toLowerCase()}{" "}
          {ApprovalStatus[task.status].toLowerCase()}
        </StepLabel>
        {task.completedDate && (
          <StepContent>
            {`on ${getLocaleDateTimeString(task.completedDate)}`}
            <CommentPaper text={task.comment} sx={DIALOG_SECTION_SX} />
          </StepContent>
        )}
      </Step>
    ))
  );
  const uncompletedTasks = approvalRequest.tasks.filter((t) => !t.completed);
  steps = steps.concat(
    uncompletedTasks.map((task, index) => (
      <Step key={`uncompletedTask${index}`} active={false}>
        <StepLabel>{task.approver.toLowerCase()}</StepLabel>
      </Step>
    ))
  );

  return (
    <Box sx={sx}>
      <Stepper orientation="vertical" activeStep={completedTasks.length}>
        {steps}
      </Stepper>
    </Box>
  );
};

export default ApprovalSteps;
