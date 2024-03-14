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
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { IApprovalRequest } from "../models/ApprovalRequest";
import { ApprovalRequestStatus } from "../models/ApprovalRequestStatus";
import { Tab } from "../models/Tab";
import { IUserFile } from "../models/UserFile";
import { approvalRequestStore } from "../stores/ApprovalRequestStore";
import { commonStore } from "../stores/CommonStore";
import { userAccountStore } from "../stores/UserAccountStore";
import { downloadUserFile } from "../utils/Downloaders";

// Send user files dialog.
const ApprovalRequestReviewDialog = () => {
  const {
    approvalRequestReviewDialogIsOpen,
    currentApprovalRequest,
    setApprovalRequestReviewDialogIsOpen,
    setCurrentApprovalRequest,
    handleApprovalRequest,
    clearApprovalRequests,
    loadApprovalRequests,
    loadNumberOfInboxApprovalRequests,
  } = approvalRequestStore;
  const { currentUser } = userAccountStore;
  const { currentTab } = commonStore;
  const [comment, setComment] = useState<string>("");

  const handleClose = () => {
    setApprovalRequestReviewDialogIsOpen(false);
    setCurrentApprovalRequest(null);
  };

  const rejectOrApprove = (status: ApprovalRequestStatus) => {
    setApprovalRequestReviewDialogIsOpen(false);
    currentApprovalRequest &&
      currentUser &&
      handleApprovalRequest(currentApprovalRequest, status, comment).then(
        () => {
          clearApprovalRequests();
          loadApprovalRequests(Tab.Inbox);
          loadNumberOfInboxApprovalRequests();
        }
      );
    setCurrentApprovalRequest(null);
  };

  const handleReject = () => {
    rejectOrApprove(ApprovalRequestStatus.Rejected);
  };

  const handleApprove = () => {
    rejectOrApprove(ApprovalRequestStatus.Approved);
  };

  const renderDialogActions = (tab: Tab) => {
    const result: JSX.Element[] = [
      <Button onClick={handleClose}>Close</Button>,
    ];
    if (tab === Tab.Inbox) {
      result.push(<Button onClick={handleReject}>Reject</Button>);
      result.push(<Button onClick={handleApprove}>Approve</Button>);
    }
    return <DialogActions>{result}</DialogActions>;
  };

  const renderDialogInputs = (tab: Tab) => {
    const result: JSX.Element[] = [];
    if (tab === Tab.Inbox) {
      result.push(
        <TextField
          margin="normal"
          fullWidth
          label="Comment"
          autoFocus
          variant="standard"
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
          multiline
          rows={4}
        />
      );
    }
    return <>{result}</>;
  };

  const renderApproveBy = (approvalRequest: IApprovalRequest) => {
    return (
      <Typography>{`Requested to approve by ${approvalRequest.approveByDate.toLocaleDateString()} ${approvalRequest.approveByDate.toLocaleTimeString()}`}</Typography>
    );
  };

  const renderComment = (comment: string) => {
    return comment ? "with comment:" : "";
  };

  const renderSteps = (approvalRequest: IApprovalRequest) => {
    const steps = approvalRequest.logs.map((log) => (
      <Step key={ApprovalRequestStatus[log.status]} active={true}>
        <StepLabel>{ApprovalRequestStatus[log.status]}</StepLabel>
        <StepContent>
          <Typography>{`On ${log.whenDate.toLocaleDateString()} at ${log.whenDate.toLocaleTimeString()} by ${log.who.toLowerCase()} ${renderComment(
            log.comment
          )}`}</Typography>
          {log.comment && (
            <Paper sx={{ p: 1, mt: 1 }} elevation={3}>
              {log.comment}
            </Paper>
          )}
        </StepContent>
      </Step>
    ));
    const alreadyApprovedBy = approvalRequest.logs.map((log) => log.who);
    const remainingApprovals = approvalRequest.approvers
      .filter((approver) => !alreadyApprovedBy.includes(approver.email))
      .map((approver) => approver.email.toLowerCase());
    if (
      steps &&
      approvalRequest.status !== ApprovalRequestStatus.Rejected &&
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
        {renderDialogInputs(currentTab)}
      </DialogContent>
      {renderDialogActions(currentTab)}
    </Dialog>
  );
};

export default observer(ApprovalRequestReviewDialog);
