import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import { Flex, StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface ApprovalRequestLogDialogProps {
  approvalRequest?: ApprovalRequest | null;
  open: boolean;
  onClose: () => void;
}

const approvalRequestLogEntrySx: SxProps<Theme> = {
  px: 1.5,
  py: 1,
};
const approvalRequestLogContentSx: SxProps<Theme> = {
  "& .MuiTypography-root": (theme) => theme.typography.body1,
  "& .MuiTypography-subtitle2": (theme) => ({
    ...theme.typography.body1,
    fontWeight: theme.typography.fontWeightMedium,
  }),
  "& .MuiTypography-caption": (theme) => theme.typography.caption,
};

const getStatusChipColor = (status: ApprovalRequestStatus) => {
  switch (status) {
    case ApprovalRequestStatus.Approved:
      return "success" as const;
    case ApprovalRequestStatus.Rejected:
      return "error" as const;
    case ApprovalRequestStatus.Pending:
      return "warning" as const;
    default:
      return "default" as const;
  }
};

const getCompletionLabel = (status: ApprovalRequestStatus) => {
  switch (status) {
    case ApprovalRequestStatus.Approved:
      return "Approved at";
    case ApprovalRequestStatus.Rejected:
      return "Rejected at";
    case ApprovalRequestStatus.Canceled:
      return "Canceled at";
    default:
      return "Completed at";
  }
};

const ApprovalRequestLogDialog: React.FC<ApprovalRequestLogDialogProps> = ({
  approvalRequest,
  open,
  onClose,
}) => {
  if (!approvalRequest) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Log</DialogTitle>
      <DialogContent dividers sx={approvalRequestLogContentSx}>
        <Stack
          spacing={StackSpacing.relaxed}
          divider={<Divider flexItem />}
        >
          <Stack spacing={StackSpacing.default} sx={approvalRequestLogEntrySx}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={StackSpacing.default}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Typography variant="subtitle2" sx={Flex.growSx}>
                {approvalRequest.title}
              </Typography>
              <Chip
                label={ApprovalRequestStatus[approvalRequest.status]}
                size="small"
                color={getStatusChipColor(approvalRequest.status)}
              />
            </Stack>
            <Typography variant="body2">
              {approvalRequest.authorEmail.toLowerCase()}
            </Typography>
            <Stack
              direction="row"
              spacing={StackSpacing.default}
              divider={<Divider orientation="vertical" flexItem />}
            >
              <Typography variant="caption" color="text.secondary">
                Created at {getLocaleDateTimeString(approvalRequest.createdAtDate)}
              </Typography>
              {approvalRequest.completedAtDate && (
                <Typography variant="caption" color="text.secondary">
                  {getCompletionLabel(approvalRequest.status)} {getLocaleDateTimeString(approvalRequest.completedAtDate)}
                </Typography>
              )}
            </Stack>
          </Stack>
          <ApprovalSteps approvalRequest={approvalRequest} showDividers />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalRequestLogDialog;
