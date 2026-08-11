import {
  AssigneeType,
  ApprovalStepAssignee,
} from "@/features/approvalWorkflow/models/approvalStep";
import { Employee } from "@/features/employees/models/employee";
import DisplayName from "@/shared/components/identity/DisplayName";
import { Dialogs } from "@/shared/constants/constants";
import { Close } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Autocomplete,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalStepAssigneeRowProps {
  assignee: ApprovalStepAssignee;
  canUseEmployees: boolean;
  canUseTeams: boolean;
  employees: Employee[];
  teams: { globalId: string; name: string }[];
  disabled?: boolean;
  removeDisabled?: boolean;
  muted?: boolean;
  onChange: (assignee: ApprovalStepAssignee) => void;
  onRemove: () => void;
}

const getAssigneeRowSx = (muted: boolean): SxProps<Theme> => ({
  opacity: muted ? 0.65 : 1,
});
const assigneeControlsSx: SxProps<Theme> = { flexWrap: "nowrap" };
const assigneeFieldSx: SxProps<Theme> = { flexGrow: 1, minWidth: 0 };

const ApprovalStepAssigneeRow: React.FC<ApprovalStepAssigneeRowProps> = ({
  assignee,
  canUseEmployees,
  canUseTeams,
  employees,
  teams,
  disabled = false,
  removeDisabled = false,
  muted = false,
  onChange,
  onRemove,
}) => {
  const recipientTypes = [
    { value: AssigneeType.User, label: "User" },
    ...(canUseEmployees
      ? [{ value: AssigneeType.Employee, label: "Employee" }]
      : []),
    ...(canUseTeams
      ? [{ value: AssigneeType.Team, label: "Team" }]
      : []),
  ];

  return (
    <Stack spacing={Dialogs.assigneeStackSpacing} sx={getAssigneeRowSx(muted)}>
      <Stack
        direction="row"
        spacing={Dialogs.assigneeStackSpacing}
        alignItems="center"
        sx={assigneeControlsSx}
      >
        <TextField
          select
          label="Type"
          value={assignee.type}
          disabled={disabled}
            onChange={(event) =>
              onChange({
                globalId: assignee.globalId,
                type: Number(event.target.value) as AssigneeType,
              })
            }
          sx={Dialogs.assigneeTypeFieldSx}
        >
          {recipientTypes.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>
        {assignee.type === AssigneeType.User && (
          <TextField
            fullWidth
            label="Email"
            value={assignee.email ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onChange({ ...assignee, email: event.target.value })
            }
            sx={assigneeFieldSx}
          />
        )}
        {assignee.type === AssigneeType.Employee && (
          <Autocomplete
            fullWidth
            options={employees}
            getOptionLabel={(option) => option.displayName}
            value={
              employees.find((user) => user.globalId === assignee.employeeGlobalId) ?? null
            }
            disabled={disabled}
            renderInput={(params) => (
              <TextField {...params} label="Employee" />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <DisplayName
                  displayName={option.displayName}
                  email={option.email}
                />
              </li>
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
            fullWidth
            options={teams}
            getOptionLabel={(option) => option.name}
            value={teams.find((team) => team.globalId === assignee.teamGlobalId) ?? null}
            disabled={disabled}
            renderInput={(params) => (
              <TextField {...params} label="Team" />
            )}
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
              sx={Dialogs.removeAssigneeButtonSx}
            >
              <Close />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default ApprovalStepAssigneeRow;
