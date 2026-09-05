import ApprovalRequestSignatureView from "@/features/approvalRequests/components/ApprovalRequestSignatureView";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { Forms } from "@/shared/components/dialogs/formStyles";
import { DrawOutlined, ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

interface ApprovalRequestElectronicSignatureViewProps {
  task: ApprovalRequestTask;
}

const electronicSignatureAccordionSx: SxProps<Theme> = (theme) => ({
  backgroundColor: alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.12 : 0.04),
  boxShadow: "none",
  "&::before": {
    display: "none",
  },
});

const electronicSignatureSummarySx: SxProps<Theme> = {
  px: Forms.formStackSpacing,
  py: 0,
  "& .MuiAccordionSummary-content": {
    my: Forms.actionSpacing,
  },
};

const electronicSignatureDetailsSx: SxProps<Theme> = {
  px: Forms.formStackSpacing,
  pb: Forms.formStackSpacing,
  pt: 0,
};

const ApprovalRequestElectronicSignatureView: React.FC<ApprovalRequestElectronicSignatureViewProps> = ({ task }) => (
  <Accordion disableGutters sx={electronicSignatureAccordionSx}>
    <AccordionSummary expandIcon={<ExpandMore />} sx={electronicSignatureSummarySx}>
      <Stack alignItems="center" direction="row" spacing={Forms.actionSpacing}>
        <DrawOutlined color="secondary" />
        <Typography color="secondary" variant="subtitle1">
          Electronic signature
        </Typography>
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={electronicSignatureDetailsSx}>
      <Stack spacing={Forms.formStackSpacing}>
        <Stack direction="row" spacing={Forms.formStackSpacing}>
          <Stack spacing={Forms.actionSpacing}>
            <Typography color="text.secondary" variant="caption">
              Legal name
            </Typography>
            <Typography>{task.assigneeLegalName || "Not provided"}</Typography>
          </Stack>
          {task.assigneeRepresentationDetails && (
            <Stack spacing={Forms.actionSpacing}>
              <Typography color="text.secondary" variant="caption">
                Representation details
              </Typography>
              <Typography>{task.assigneeRepresentationDetails}</Typography>
            </Stack>
          )}
        </Stack>
        <Stack spacing={Forms.actionSpacing}>
          <Typography color="text.secondary" variant="caption">
            Signature
          </Typography>
          <ApprovalRequestSignatureView signatureJson={task.assigneeSignatureJson} />
        </Stack>
      </Stack>
    </AccordionDetails>
  </Accordion>
);

export default ApprovalRequestElectronicSignatureView;
