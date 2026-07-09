import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { Accordions, Dialogs, StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

interface TaskRequestDetailsAccordionProps {
  approvalRequest?: ApprovalRequest;
}

const getStatusChipColor = (status: ApprovalRequestStatus) => {
  switch (status) {
    case ApprovalRequestStatus.Approved:
      return "success" as const;
    case ApprovalRequestStatus.Rejected:
      return "error" as const;
    case ApprovalRequestStatus.Submitted:
      return "warning" as const;
    default:
      return "default" as const;
  }
};

const TaskRequestDetailsAccordion: React.FC<
  TaskRequestDetailsAccordionProps
> = ({ approvalRequest }) => {
  if (!approvalRequest) {
    return null;
  }

  return (
    <Accordion disableGutters sx={Accordions.detailsSx}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack
          direction="row"
          spacing={StackSpacing.default}
          alignItems="center"
        >
          <Typography>{approvalRequest.title || "Request details"}</Typography>
          <Chip
            label={ApprovalRequestStatus[approvalRequest.status]}
            size="small"
            color={getStatusChipColor(approvalRequest.status)}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={Accordions.detailsContentSx}>
        <Stack spacing={StackSpacing.default}>
          {approvalRequest.authorEmail && (
            <Typography variant="body2">
              Created by {approvalRequest.authorEmail.toLowerCase()}
            </Typography>
          )}
          <Typography variant="body2">
            Created on {getLocaleDateTimeString(approvalRequest.createdAtDate)}
          </Typography>
          {approvalRequest.approveByDate && (
            <Typography variant="body2">
              Review by {getLocaleDateTimeString(approvalRequest.approveByDate)}
            </Typography>
          )}
          {approvalRequest.clonedFromApprovalRequestId && (
            <Typography variant="body2">Cloned from another request</Typography>
          )}
          <CommentPaper
            text={approvalRequest.comment}
            label="Requester comment"
            sx={Dialogs.sectionSx}
          />
          <ApprovalSteps approvalRequest={approvalRequest} />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default TaskRequestDetailsAccordion;
