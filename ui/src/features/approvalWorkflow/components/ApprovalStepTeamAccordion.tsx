import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import type { ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import { Dialogs, Flex, StackSpacing } from "@/shared/constants/constants";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Stack } from "@mui/material";
import type { ReactNode } from "react";

interface ApprovalStepTeamAccordionProps {
  assignee: ApprovalStepAssignee;
  children: ReactNode;
  index: number;
}

const accordionSx = { bgcolor: "transparent", boxShadow: "none", "&::before": { display: "none" } };
const summarySx = { minHeight: 0, px: 0, py: 0, "& .MuiAccordionSummary-content": { my: 0 } };
const detailsSx = { px: 0, pb: 0, pt: Dialogs.stepHeaderSpacing };

const ApprovalStepTeamAccordion: React.FC<ApprovalStepTeamAccordionProps> = ({ assignee, children, index }) => (
  <Accordion defaultExpanded disableGutters key={assignee.globalId ?? index} sx={accordionSx}>
    <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx}>
      <Stack alignItems="center" direction="row" spacing={StackSpacing.tight} sx={Flex.growSx}>
        <ApprovalRequestParticipant displayName={assignee.displayName} email={assignee.email} type={assignee.type} />
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={detailsSx}>{children}</AccordionDetails>
  </Accordion>
);

export default ApprovalStepTeamAccordion;
