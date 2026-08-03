import ApprovalRequestSignatureView from "@/features/approvalRequests/components/ApprovalRequestSignatureView";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { Dialogs } from "@/shared/constants/constants";
import { DrawOutlined, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

interface ApprovalRequestElectronicSignatureViewProps {
  task: ApprovalRequestTask;
}

const electronicSignatureAccordionSx: SxProps<Theme> = (theme) => ({
  backgroundColor: alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.12 : 0.04),
  boxShadow: "none",
  borderRadius: 1,
  "&::before": {
    display: "none",
  },
});

const electronicSignatureSummarySx: SxProps<Theme> = {
  px: Dialogs.formStackSpacing,
  py: 0,
  "& .MuiAccordionSummary-content": {
    my: Dialogs.stepHeaderSpacing,
  },
};

const electronicSignatureDetailsSx: SxProps<Theme> = {
  px: Dialogs.formStackSpacing,
  pb: Dialogs.formStackSpacing,
  pt: 0,
};

const ApprovalRequestElectronicSignatureView: React.FC<ApprovalRequestElectronicSignatureViewProps> = ({
  task,
}) => (
  <Accordion
    disableGutters
    sx={electronicSignatureAccordionSx}
  >
    <AccordionSummary
      expandIcon={<ExpandMore />}
      sx={electronicSignatureSummarySx}
    >
      <Stack
        alignItems="center"
        direction="row"
        spacing={Dialogs.stepHeaderSpacing}
      >
        <DrawOutlined color="secondary" />
        <Typography color="secondary" variant="subtitle1">
          Electronic signature
        </Typography>
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={electronicSignatureDetailsSx}>
      <Stack spacing={Dialogs.formStackSpacing}>
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
            Signature
          </Typography>
          <ApprovalRequestSignatureView signatureJson={task.approverSignatureJson} />
        </Stack>
      </Stack>
    </AccordionDetails>
  </Accordion>
);

export default ApprovalRequestElectronicSignatureView;
