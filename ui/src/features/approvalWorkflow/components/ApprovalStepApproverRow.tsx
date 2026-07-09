import {
  ApprovalRecipientType,
  ApprovalStepApprover,
} from "@/features/approvalWorkflow/models/approvalStep";
import { Employee } from "@/features/employees/models/employee";
import { getEmployeeDisplayName } from "@/features/employees/utils/employeeLabels";
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
  teams: { id: number; name: string }[];
  disabled?: boolean;
  removeDisabled?: boolean;
  muted?: boolean;
  onChange: (approver: ApprovalStepApprover) => void;
  onRemove: () => void;
}

const getApproverRowSx = (muted: boolean): SxProps<Theme> => ({
  opacity: muted ? 0.65 : 1,
});

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
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={Dialogs.approverStackSpacing}
      alignItems={{ xs: "stretch", sm: "center" }}
      sx={getApproverRowSx(muted)}
    >
      <TextField
        select
        label="Type"
        value={approver.type}
        disabled={disabled}
        onChange={(event) =>
          onChange({
            type: Number(event.target.value) as ApprovalRecipientType,
            canViewRequest: approver.canViewRequest,
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
        />
      )}
      {approver.type === ApprovalRecipientType.Employee && (
        <Autocomplete
          fullWidth
          options={employees}
          getOptionLabel={getEmployeeDisplayName}
          value={
            employees.find((user) => user.id === approver.employeeId) ?? null
          }
          disabled={disabled}
          renderInput={(params) => <TextField {...params} label="Employee" />}
          onChange={(_, value) =>
            onChange({
              ...approver,
              employeeId: value?.id,
              displayName: value ? getEmployeeDisplayName(value) : undefined,
            })
          }
        />
      )}
      {approver.type === ApprovalRecipientType.Team && (
        <Autocomplete
          fullWidth
          options={teams}
          getOptionLabel={(option) => option.name}
          value={teams.find((team) => team.id === approver.teamId) ?? null}
          disabled={disabled}
          renderInput={(params) => <TextField {...params} label="Team" />}
          onChange={(_, value) =>
            onChange({
              ...approver,
              teamId: value?.id,
              displayName: value?.name,
            })
          }
        />
      )}
      <FormControlLabel
        control={
          <Switch
            checked={approver.canViewRequest}
            disabled={disabled}
            onChange={(_, checked) =>
              onChange({ ...approver, canViewRequest: checked })
            }
          />
        }
        label="Can view request details"
      />
      <Tooltip title="Remove approver">
        <span>
          <IconButton
            aria-label="Remove approver"
            disabled={removeDisabled}
            onClick={onRemove}
            sx={Dialogs.removeApproverButtonSx}
          >
            <Close />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
};

export default ApprovalStepApproverRow;
