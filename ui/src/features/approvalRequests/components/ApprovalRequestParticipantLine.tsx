import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { EmployeeStatus } from "@/features/employees/models/employee";
import { Flex } from "@/shared/components/layout/flexStyles";
import { StackSpacing } from "@/shared/theme/tokens";
import { EmailOutlined, GroupsOutlined, PersonOffOutlined, PersonOutlined } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestParticipantLineProps {
  allowDisplayNameWrap?: boolean;
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

const participantLineSx = {
  ...Flex.alignCenterSx,
  minWidth: 0,
  "& .MuiSvgIcon-root": { flexShrink: 0 },
} as const;
const wrappedLabelSx = { minWidth: 0, overflowWrap: "anywhere" } as const;

export const disabledEmployeeMessage = "This employee is disabled and no longer has access to this organization.";
export const getAssigneeIcon = (type: AssigneeType, employeeStatus?: EmployeeStatus, disabled = false) => {
  const color = disabled ? "disabled" : "action";

  switch (type) {
    case AssigneeType.Employee:
      return employeeStatus === EmployeeStatus.Disabled ? (
        <PersonOffOutlined color={color} fontSize="small" />
      ) : (
        <PersonOutlined color={color} fontSize="small" />
      );
    case AssigneeType.Team:
      return <GroupsOutlined color={color} fontSize="small" />;
    default:
      return <EmailOutlined color={color} fontSize="small" />;
  }
};

const ApprovalRequestParticipantLine: React.FC<ApprovalRequestParticipantLineProps> = ({
  allowDisplayNameWrap = false,
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
        <Box component="span" sx={Flex.displaySx}>
          {participantIcon}
        </Box>
      </Tooltip>
    ) : (
      participantIcon
    );

  return (
    <Stack direction="row" spacing={StackSpacing.tight} sx={[participantLineSx, ...(Array.isArray(sx) ? sx : [sx])]}>
      {displayedIcon}
      {typeof participantLabel === "string" || typeof participantLabel === "number" ? (
        <Typography
          noWrap={!allowDisplayNameWrap}
          variant={variant}
          sx={allowDisplayNameWrap ? wrappedLabelSx : undefined}
        >
          {participantLabel}
        </Typography>
      ) : (
        participantLabel
      )}
    </Stack>
  );
};

export default ApprovalRequestParticipantLine;
