import {
  ApprovalRecipientType,
  ApprovalStepApprover,
} from "@/features/approvalWorkflow/models/approvalStep";
import { Employee } from "@/features/employees/models/employee";
import DisplayName from "@/shared/components/identity/DisplayName";
import { Dialogs } from "@/shared/constants/constants";
import { Close } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Autocomplete,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalStepApproverRowProps {
  approver: ApprovalStepApprover;
  canUseEmployees: boolean;
  canUseTeams: boolean;
  employees: Employee[];
  teams: { globalId: string; name: string }[];
  disabled?: boolean;
  removeDisabled?: boolean;
  muted?: boolean;
  onChange: (approver: ApprovalStepApprover) => void;
  onRemove: () => void;
}

const getApproverRowSx = (muted: boolean): SxProps<Theme> => ({
  opacity: muted ? 0.65 : 1,
});
const assigneeControlsSx: SxProps<Theme> = { flexWrap: "nowrap" };
const assigneeFieldSx: SxProps<Theme> = { flexGrow: 1, minWidth: 0 };

const ApprovalStepApproverRow: React.FC<ApprovalStepApproverRowProps> = ({
  approver,
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
    { value: ApprovalRecipientType.Email, label: "Email" },
    ...(canUseEmployees
      ? [{ value: ApprovalRecipientType.Employee, label: "Employee" }]
      : []),
    ...(canUseTeams
      ? [{ value: ApprovalRecipientType.Team, label: "Team" }]
      : []),
  ];

  return (
    <Stack spacing={Dialogs.approverStackSpacing} sx={getApproverRowSx(muted)}>
      <Stack
        direction="row"
        spacing={Dialogs.approverStackSpacing}
        alignItems="center"
        sx={assigneeControlsSx}
      >
        <TextField
          select
          label="Type"
          value={approver.type}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              globalId: approver.globalId,
              type: Number(event.target.value) as ApprovalRecipientType,
              requiresIdentityVerification: approver.requiresIdentityVerification,
            })
          }
          sx={Dialogs.approverTypeFieldSx}
        >
          {recipientTypes.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>
        {approver.type === ApprovalRecipientType.Email && (
          <TextField
            fullWidth
            label="Email"
            value={approver.email ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onChange({ ...approver, email: event.target.value })
            }
            sx={assigneeFieldSx}
          />
        )}
        {approver.type === ApprovalRecipientType.Employee && (
          <Autocomplete
            fullWidth
            options={employees}
            getOptionLabel={(option) => option.displayName}
            value={
              employees.find((user) => user.globalId === approver.employeeGlobalId) ?? null
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
                ...approver,
                employeeGlobalId: value?.globalId,
              })
            }
            sx={assigneeFieldSx}
          />
        )}
        {approver.type === ApprovalRecipientType.Team && (
          <Autocomplete
            fullWidth
            options={teams}
            getOptionLabel={(option) => option.name}
            value={teams.find((team) => team.globalId === approver.teamGlobalId) ?? null}
            disabled={disabled}
            renderInput={(params) => (
              <TextField {...params} label="Team" />
            )}
            onChange={(_, value) =>
              onChange({
                ...approver,
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
              sx={Dialogs.removeApproverButtonSx}
            >
              <Close />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      <FormControlLabel
        control={(
          <Switch
            checked={approver.requiresIdentityVerification === true}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                ...approver,
                requiresIdentityVerification: event.target.checked,
              })
            }
          />
        )}
        label="Require identity verification"
      />
    </Stack>
  );
};

export default ApprovalStepApproverRow;
