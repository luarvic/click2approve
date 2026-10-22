import { approvalStepIconSx } from "@/features/approvalWorkflow/components/approvalStepStyles";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import { getAssigneeIcon } from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import type { ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import { Box } from "@mui/material";
import { cloneElement } from "react";

interface ApprovalStepAssigneesProps {
  assignees: ApprovalStepAssignee[];
  sequence?: number;
  label?: string;
}

const assigneeListSx = {
  display: "contents",
  minWidth: 0,
  listStyle: "none",
  p: 0,
  m: 0,
} as const;
const assigneeItemSx = { minWidth: 0, maxWidth: "100%" } as const;

const ApprovalStepAssignees: React.FC<ApprovalStepAssigneesProps> = ({ assignees, sequence, label }) =>
  assignees.length > 0 ? (
    <Box
      component="ul"
      aria-label={label ?? (sequence ? `Step ${sequence} assignees` : "Assignees")}
      sx={assigneeListSx}
    >
      {assignees.map((assignee, index) => (
        <Box component="li" key={assignee.globalId ?? index} sx={assigneeItemSx}>
          <ApprovalRequestParticipant
            allowDisplayNameWrap
            icon={cloneElement(getAssigneeIcon(assignee.type), { color: "inherit", sx: approvalStepIconSx })}
            displayName={assignee.displayName}
            email={assignee.email}
            type={assignee.type}
            variant="body2"
          />
        </Box>
      ))}
    </Box>
  ) : null;

export default ApprovalStepAssignees;
