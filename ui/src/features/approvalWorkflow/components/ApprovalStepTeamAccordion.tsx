import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import { ApprovalStepStyles } from "@/features/approvalWorkflow/components/approvalStepStyles";
import type { ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import { Flex } from "@/shared/components/layout/flexStyles";
import { StackSpacing } from "@/shared/theme/tokens";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Stack } from "@mui/material";
import type { ReactNode } from "react";

interface ApprovalStepTeamAccordionProps {
  assignee: ApprovalStepAssignee;
  children: ReactNode;
  index: number;
}

const ApprovalStepTeamAccordion: React.FC<ApprovalStepTeamAccordionProps> = ({ assignee, children, index }) => (
  <Accordion
    defaultExpanded
    disableGutters
    key={assignee.globalId ?? index}
    sx={ApprovalStepStyles.assigneeAccordionSx}
  >
    <AccordionSummary expandIcon={<ExpandMore />} sx={ApprovalStepStyles.assigneeSummarySx}>
      <Stack direction="row" spacing={StackSpacing.tight} sx={[Flex.alignCenterSx, Flex.growSx]}>
        <ApprovalRequestParticipant displayName={assignee.displayName} email={assignee.email} type={assignee.type} />
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={ApprovalStepStyles.assigneeDetailsSx}>{children}</AccordionDetails>
  </Accordion>
);

export default ApprovalStepTeamAccordion;
