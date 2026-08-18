import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { Dialogs } from "@/shared/constants/constants";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalStepIndividualAssigneesProps {
  children: ReactNode;
}

const accordionSx: SxProps<Theme> = {
  bgcolor: "transparent",
  boxShadow: "none",
  "&::before": {
    display: "none",
  },
};

const accordionSummarySx: SxProps<Theme> = {
  minHeight: 0,
  px: 0,
  py: 0,
  "& .MuiAccordionSummary-content": {
    my: 0,
  },
};

const accordionDetailsSx: SxProps<Theme> = {
  pb: 0,
  pt: Dialogs.stepHeaderSpacing,
  px: 0,
};

const ApprovalStepIndividualAssignees: React.FC<ApprovalStepIndividualAssigneesProps> = ({ children }) => (
  <Accordion defaultExpanded disableGutters sx={accordionSx}>
    <AccordionSummary expandIcon={<ExpandMore />} sx={accordionSummarySx}>
      <ApprovalRequestParticipant displayName="Individual assignees" type={AssigneeType.Team} />
    </AccordionSummary>
    <AccordionDetails sx={accordionDetailsSx}>{children}</AccordionDetails>
  </Accordion>
);

export default ApprovalStepIndividualAssignees;
