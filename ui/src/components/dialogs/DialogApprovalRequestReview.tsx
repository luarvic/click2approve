import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  List,
  ListItem,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { IApprovalRequest } from "../../models/ApprovalRequest";
import { ApprovalStatus } from "../../models/ApprovalStatus";
import { IUserFile } from "../../models/UserFile";
import { approvalRequestStore } from "../../stores/ApprovalRequestStore";
import { commonStore } from "../../stores/CommonStore";
import { downloadUserFile } from "../../utils/Downloaders";

const DialogApprovalRequestReview = () => {
  const {
    approvalRequestReviewDialogIsOpen,
    setApprovalRequestReviewDialogIsOpen,
  } = commonStore;
  const { currentApprovalRequest, setCurrentApprovalRequest } =
    approvalRequestStore;

  const handleClose = () => {
    setApprovalRequestReviewDialogIsOpen(false);
    setCurrentApprovalRequest(null);
  };

  const renderApproveBy = (approvalRequest: IApprovalRequest) => {
    return (
      <Typography>{`Requested to approve by ${approvalRequest.approveByDate.toLocaleDateString()} ${approvalRequest.approveByDate.toLocaleTimeString()}`}</Typography>
    );
  };

  const renderSteps = (approvalRequest: IApprovalRequest) => {
    const steps = approvalRequest.logs.map((log) => (
      <Step active={true}>
        <StepLabel>{log.what}</StepLabel>
        <StepContent>
          <Typography>{`On ${log.whenDate.toLocaleDateString()} at ${log.whenDate.toLocaleTimeString()} by ${log.who.toLowerCase()}`}</Typography>
        </StepContent>
      </Step>
    ));
    const alreadyApprovedBy = approvalRequest.logs.map((log) => log.who);
    const remainingApprovals: string[] = [];
    if (
      steps &&
      approvalRequest.status !== ApprovalStatus.Rejected &&
      remainingApprovals.length > 0
    ) {
      steps.push(
        <Step key="Waiting">
          <StepLabel>Waiting for approval from</StepLabel>
          <StepContent>
            <List disablePadding>
              {remainingApprovals.map((approver) => (
                <ListItem disablePadding>
                  <Typography>{approver}</Typography>
                </ListItem>
              ))}
            </List>
          </StepContent>
        </Step>
      );
    }

    return (
      <Box sx={{ pb: 2 }}>
        <Stepper
          orientation="vertical"
          activeStep={approvalRequest?.logs ? approvalRequest?.logs.length : 0}
        >
          {steps}
        </Stepper>
      </Box>
    );
  };

  return (
    <Dialog open={approvalRequestReviewDialogIsOpen} onClose={handleClose}>
      <DialogTitle>Review</DialogTitle>
      <DialogContent dividers>
        {currentApprovalRequest && renderApproveBy(currentApprovalRequest)}
        <List>
          {currentApprovalRequest &&
            currentApprovalRequest.userFiles.map((userFile: IUserFile) => {
              return (
                <ListItem disablePadding>
                  <Link
                    component="button"
                    onClick={() => downloadUserFile(userFile)}
                  >
                    {userFile.name}
                  </Link>
                </ListItem>
              );
            })}
        </List>
        {currentApprovalRequest && renderSteps(currentApprovalRequest)}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(DialogApprovalRequestReview);
