import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { EmployeeStatus } from "@/features/employees/models/employee";
import { StackSpacing } from "@/shared/theme/tokens";
import { Email, Groups, Person, PersonOff } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestParticipantLineProps {
  disabled?: boolean;
  displayName?: string | null;
  email?: string | null;
  employeeStatus?: EmployeeStatus;
  icon?: ReactNode;
  label?: ReactNode;
  sx?: SxProps<Theme>;
  type?: AssigneeType;
  variant?: "body1" | "body2";
}

export const disabledEmployeeMessage = "This employee is disabled and no longer has access to this organization.";
const tooltipIconSx: SxProps<Theme> = { display: "flex" };

export const getAssigneeIcon = (type: AssigneeType, employeeStatus?: EmployeeStatus, disabled = false) => {
  const color = disabled ? "disabled" : "action";

  switch (type) {
    case AssigneeType.Employee:
      return employeeStatus === EmployeeStatus.Disabled ? (
        <PersonOff color={color} fontSize="small" />
      ) : (
        <Person color={color} fontSize="small" />
      );
    case AssigneeType.Team:
      return <Groups color={color} fontSize="small" />;
    default:
      return <Email color={color} fontSize="small" />;
  }
};

const ApprovalRequestParticipantLine: React.FC<ApprovalRequestParticipantLineProps> = ({
  disabled = false,
  displayName,
  email,
  employeeStatus,
  icon,
  label,
  sx,
  type = AssigneeType.Employee,
  variant = "body1",
}) => {
  const participantLabel =
    label ??
    (type === AssigneeType.User
      ? email || displayName || "Unknown user"
      : displayName || email || (type === AssigneeType.Team ? "Unknown team" : "Unknown employee"));
  const participantIcon = icon ?? getAssigneeIcon(type, employeeStatus, disabled);
  const displayedIcon =
    type === AssigneeType.Employee && employeeStatus === EmployeeStatus.Disabled ? (
      <Tooltip title={disabledEmployeeMessage}>
        <Box component="span" sx={tooltipIconSx}>
          {participantIcon}
        </Box>
      </Tooltip>
    ) : (
      participantIcon
    );

  return (
    <Stack direction="row" spacing={StackSpacing.tight} alignItems="center" sx={sx}>
      {displayedIcon}
      {typeof participantLabel === "string" || typeof participantLabel === "number" ? (
        <Typography noWrap variant={variant}>
          {participantLabel}
        </Typography>
      ) : (
        participantLabel
      )}
    </Stack>
  );
};

export default ApprovalRequestParticipantLine;
