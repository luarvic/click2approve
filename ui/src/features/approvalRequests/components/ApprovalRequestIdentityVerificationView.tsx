import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import ApprovalRequestSignatureView from "@/features/approvalRequests/components/ApprovalRequestSignatureView";
import { Dialogs } from "@/shared/constants/constants";
import { ExpandMore } from "@mui/icons-material";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import dayjs from "dayjs";

interface ApprovalRequestIdentityVerificationViewProps {
  task: ApprovalRequestTask;
}

const identityVerificationAccordionSx: SxProps<Theme> = (theme) => ({
  backgroundColor: alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.12 : 0.04),
  boxShadow: "none",
  borderRadius: 1,
  "&::before": {
    display: "none",
  },
});

const identityVerificationSummarySx: SxProps<Theme> = {
  px: Dialogs.formStackSpacing,
  py: 0,
  "& .MuiAccordionSummary-content": {
    my: Dialogs.stepHeaderSpacing,
  },
};

const identityVerificationDetailsSx: SxProps<Theme> = {
  px: Dialogs.formStackSpacing,
  pb: Dialogs.formStackSpacing,
  pt: 0,
};

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
  <Accordion
    disableGutters
    sx={identityVerificationAccordionSx}
  >
    <AccordionSummary
      expandIcon={<ExpandMore />}
      sx={identityVerificationSummarySx}
    >
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
    </AccordionSummary>
    <AccordionDetails sx={identityVerificationDetailsSx}>
      <Stack spacing={Dialogs.formStackSpacing}>
        <Stack
          direction={identityVerificationFieldRowDirection}
          spacing={Dialogs.formStackSpacing}
        >
          <Stack spacing={Dialogs.stepHeaderSpacing}>
            <Typography color="text.secondary" variant="caption">
              Legal name
            </Typography>
            <Typography>
              {task.approverLegalName || "Not provided"}
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
    </AccordionDetails>
  </Accordion>
);

export default ApprovalRequestIdentityVerificationView;
