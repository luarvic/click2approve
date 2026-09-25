import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import { ApprovalStepStyles } from "@/features/approvalWorkflow/components/approvalStepStyles";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import type { ReactNode } from "react";

interface ApprovalStepIndividualAssigneesProps {
  children: ReactNode;
}

const ApprovalStepIndividualAssignees: React.FC<ApprovalStepIndividualAssigneesProps> = ({ children }) => (
  <Accordion defaultExpanded disableGutters sx={ApprovalStepStyles.assigneeAccordionSx}>
    <AccordionSummary expandIcon={<ExpandMore />} sx={ApprovalStepStyles.assigneeSummarySx}>
      <ApprovalRequestParticipant displayName="Individual assignees" type={AssigneeType.Team} />
    </AccordionSummary>
    <AccordionDetails sx={ApprovalStepStyles.assigneeDetailsSx}>{children}</AccordionDetails>
  </Accordion>
);

export default ApprovalStepIndividualAssignees;
