import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import ApprovalRequestSignatureView from "@/features/approvalRequests/components/ApprovalRequestSignatureView";
import { Dialogs } from "@/shared/constants/constants";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import dayjs from "dayjs";

interface ApprovalRequestIdentityVerificationViewProps {
  task: ApprovalRequestTask;
}

const identityVerificationViewSx: SxProps<Theme> = (theme) => ({
  backgroundColor: alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.12 : 0.04),
  borderRadius: 1,
  p: Dialogs.formStackSpacing,
});

const identityVerificationFieldRowDirection = { xs: "column", sm: "row" } as const;

const formatDateOfBirth = (value?: string): string => {
  if (!value) {
    return "Not provided";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("MMM D, YYYY") : value;
};

const ApprovalRequestIdentityVerificationView: React.FC<ApprovalRequestIdentityVerificationViewProps> = ({
  task,
}) => (
  <Box sx={identityVerificationViewSx}>
    <Stack spacing={Dialogs.formStackSpacing}>
      <Stack
        alignItems="center"
        direction="row"
        spacing={Dialogs.stepHeaderSpacing}
      >
        <VerifiedUserOutlinedIcon color="secondary" />
        <Typography color="secondary" variant="subtitle1">
          Identity verification
        </Typography>
      </Stack>
      <Stack
        direction={identityVerificationFieldRowDirection}
        spacing={Dialogs.formStackSpacing}
      >
        <Stack spacing={Dialogs.stepHeaderSpacing}>
          <Typography color="text.secondary" variant="caption">
            Legal first name
          </Typography>
          <Typography>
            {task.approverLegalFirstName || "Not provided"}
          </Typography>
        </Stack>
        <Stack spacing={Dialogs.stepHeaderSpacing}>
          <Typography color="text.secondary" variant="caption">
            Legal last name
          </Typography>
          <Typography>
            {task.approverLegalLastName || "Not provided"}
          </Typography>
        </Stack>
        <Stack spacing={Dialogs.stepHeaderSpacing}>
          <Typography color="text.secondary" variant="caption">
            Date of birth
          </Typography>
          <Typography>
            {formatDateOfBirth(task.approverDateOfBirth)}
          </Typography>
        </Stack>
      </Stack>
      <Stack spacing={Dialogs.stepHeaderSpacing}>
        <Typography color="text.secondary" variant="caption">
          Signature
        </Typography>
        <ApprovalRequestSignatureView signatureJson={task.approverSignatureJson} />
      </Stack>
    </Stack>
  </Box>
);

export default ApprovalRequestIdentityVerificationView;
