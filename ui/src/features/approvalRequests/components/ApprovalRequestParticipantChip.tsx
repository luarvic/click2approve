import { getAssigneeIcon } from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { EmployeeStatus } from "@/features/employees/models/employee";
import type { ChipProps, SxProps } from "@mui/material";
import { Chip } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalRequestParticipantChipProps extends Omit<ChipProps, "icon" | "label"> {
  displayName?: string;
  email?: string;
  employeeStatus?: EmployeeStatus;
  type: AssigneeType;
}

const chipSx: SxProps<Theme> = {
  alignItems: "center",
  "& .MuiChip-icon": {
    marginBottom: 0,
    marginTop: 0,
  },
  "& .MuiChip-label": {
    alignItems: "center",
    display: "flex",
    // fontSize: "1rem",
  },
};

const ApprovalRequestParticipantChip: React.FC<ApprovalRequestParticipantChipProps> = ({
  displayName,
  email,
  employeeStatus,
  sx,
  type,
  ...chipProps
}) => {
  const label =
    type === AssigneeType.User
      ? email || displayName || "Unknown user"
      : displayName || email || (type === AssigneeType.Team ? "Unknown team" : "Unknown employee");

  return (
    <Chip
      {...chipProps}
      icon={getAssigneeIcon(type, employeeStatus)}
      label={label}
      sx={[chipSx, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
};

export default ApprovalRequestParticipantChip;
