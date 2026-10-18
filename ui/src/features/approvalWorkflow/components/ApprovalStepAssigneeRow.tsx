import {
  ApprovalStepStyles,
  AssigneeTypeFieldMinWidth,
} from "@/features/approvalWorkflow/components/approvalStepStyles";
import { ApprovalStepAssignee, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { getEmployeeDisplayName } from "@/shared/utils/displayNameHelpers";
import { Close } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Autocomplete, IconButton, MenuItem, Stack, TextField, Tooltip } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalStepAssigneeRowProps {
  assignee: ApprovalStepAssignee;
  canUseEmployees: boolean;
  canUseTeams: boolean;
  employees: Employee[];
  teams: { globalId: string; name: string }[];
  error?: string;
  disabled?: boolean;
  removeDisabled?: boolean;
  muted?: boolean;
  onChange: (assignee: ApprovalStepAssignee) => void;
  onRemove: () => void;
  stackControlsOnSmallScreens?: boolean;
}

const getAssigneeRowSx = (muted: boolean): SxProps<Theme> => ({
  opacity: muted ? 0.65 : 1,
});
const getAssigneeControlsSx = (stackOnSmallScreens: boolean): SxProps<Theme> => ({
  alignItems: stackOnSmallScreens ? { xs: "stretch", sm: "flex-start" } : "flex-start",
  flexWrap: "nowrap",
});
const assigneeFieldSx: SxProps<Theme> = { flexGrow: 1, minWidth: 0 };
const assigneeFieldControlsSx: SxProps<Theme> = {
  alignItems: "flex-start",
  flex: 1,
  minWidth: 0,
};
const responsiveAssigneeTypeFieldSx: SxProps<Theme> = {
  minWidth: AssigneeTypeFieldMinWidth,
  width: { xs: "100%", sm: "auto" },
};
const getAssigneeEmployeeLabel = (employee: Employee) =>
  `${getEmployeeDisplayName(employee)}${employee.status === EmployeeStatus.Disabled ? " (disabled)" : ""}`;

const ApprovalStepAssigneeRow: React.FC<ApprovalStepAssigneeRowProps> = ({
  assignee,
  canUseEmployees,
  canUseTeams,
  employees,
  teams,
  error,
  disabled = false,
  removeDisabled = false,
  muted = false,
  onChange,
  onRemove,
  stackControlsOnSmallScreens = false,
}) => {
  const recipientTypes = [
    { value: AssigneeType.User, label: "User" },
    ...(canUseEmployees ? [{ value: AssigneeType.Employee, label: "Employee" }] : []),
    ...(canUseTeams ? [{ value: AssigneeType.Team, label: "Team" }] : []),
  ];

  return (
    <Stack spacing={ApprovalStepStyles.assigneeStackSpacing} sx={getAssigneeRowSx(muted)}>
      <Stack
        direction={stackControlsOnSmallScreens ? { xs: "column", sm: "row" } : "row"}
        spacing={ApprovalStepStyles.assigneeStackSpacing}
        sx={getAssigneeControlsSx(stackControlsOnSmallScreens)}
      >
        <TextField
          select
          label="Type"
          value={assignee.type}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              globalId: assignee.globalId,
              type: event.target.value as AssigneeType,
            })
          }
          sx={stackControlsOnSmallScreens ? responsiveAssigneeTypeFieldSx : ApprovalStepStyles.assigneeTypeFieldSx}
        >
          {recipientTypes.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>
        <Stack direction="row" spacing={ApprovalStepStyles.assigneeStackSpacing} sx={assigneeFieldControlsSx}>
          {assignee.type === AssigneeType.User && (
            <TextField
              fullWidth
              label="Email"
              error={Boolean(error)}
              helperText={error}
              value={assignee.email ?? ""}
              disabled={disabled}
              onChange={(event) => onChange({ ...assignee, email: event.target.value })}
              sx={assigneeFieldSx}
            />
          )}
          {assignee.type === AssigneeType.Employee && (
            <Autocomplete
              disableClearable={assignee.employeeGlobalId !== undefined}
              fullWidth
              options={employees}
              getOptionDisabled={(employee) => employee.status === EmployeeStatus.Disabled}
              getOptionKey={(option) => option.globalId}
              getOptionLabel={getAssigneeEmployeeLabel}
              value={employees.find((user) => user.globalId === assignee.employeeGlobalId) ?? null}
              disabled={disabled}
              renderInput={(params) => (
                <TextField {...params} label="Employee" error={Boolean(error)} helperText={error} />
              )}
              onChange={(_, value) =>
                onChange({
                  ...assignee,
                  employeeGlobalId: value?.globalId,
                })
              }
              sx={assigneeFieldSx}
            />
          )}
          {assignee.type === AssigneeType.Team && (
            <Autocomplete
              disableClearable={assignee.teamGlobalId !== undefined}
              fullWidth
              options={teams}
              getOptionKey={(option) => option.globalId}
              getOptionLabel={(option) => option.name}
              value={teams.find((team) => team.globalId === assignee.teamGlobalId) ?? null}
              disabled={disabled}
              renderInput={(params) => <TextField {...params} label="Team" error={Boolean(error)} helperText={error} />}
              onChange={(_, value) =>
                onChange({
                  ...assignee,
                  teamGlobalId: value?.globalId,
                })
              }
              sx={assigneeFieldSx}
            />
          )}
          <Tooltip title="Remove assignee">
            <span>
              <IconButton
                aria-label="Remove assignee"
                disabled={removeDisabled}
                onClick={onRemove}
                sx={ApprovalStepStyles.removeAssigneeButtonSx}
              >
                <Close />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ApprovalStepAssigneeRow;
