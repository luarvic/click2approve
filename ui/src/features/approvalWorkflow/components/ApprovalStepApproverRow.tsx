import {
  ApprovalRecipientType,
  ApprovalStepApprover,
} from "@/features/approvalWorkflow/models/approvalStep";
import { Employee } from "@/features/employees/models/employee";
import { getEmployeeDisplayName } from "@/features/employees/utils/employeeLabels";
import { Dialogs } from "@/shared/constants/constants";
import { Close, InfoOutlined } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Autocomplete,
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState } from "react";

interface ApprovalStepApproverRowProps {
  approver: ApprovalStepApprover;
  canUseEmployees: boolean;
  canUseTeams: boolean;
  canViewRequestIsVisible?: boolean;
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
const assigneeControlsSx: SxProps<Theme> = { flexWrap: "nowrap" };
const assigneeFieldSx: SxProps<Theme> = { flexGrow: 1, minWidth: 0 };
const trackingInfoSx: SxProps<Theme> = { p: 2, maxWidth: 280 };
const trackingControlsSx: SxProps<Theme> = {
  pb: Dialogs.approverStackSpacing,
};

const ApprovalStepApproverRow: React.FC<ApprovalStepApproverRowProps> = ({
  approver,
  canUseEmployees,
  canUseTeams,
  canViewRequestIsVisible = true,
  employees,
  teams,
  disabled = false,
  removeDisabled = false,
  muted = false,
  onChange,
  onRemove,
}) => {
  const [trackingInfoAnchor, setTrackingInfoAnchor] =
    useState<HTMLElement | null>(null);
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
              id: approver.id,
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
            sx={assigneeFieldSx}
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
            renderInput={(params) => (
              <TextField {...params} label="Employee" />
            )}
            onChange={(_, value) =>
              onChange({
                ...approver,
                employeeId: value?.id,
                displayName: value ? getEmployeeDisplayName(value) : undefined,
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
            value={teams.find((team) => team.id === approver.teamId) ?? null}
            disabled={disabled}
            renderInput={(params) => (
              <TextField {...params} label="Team" />
            )}
            onChange={(_, value) =>
              onChange({
                ...approver,
                teamId: value?.id,
                displayName: value?.name,
              })
            }
            sx={assigneeFieldSx}
          />
        )}
        <Tooltip title="Remove approver">
          <span>
            <IconButton
              aria-label="Remove approver"
              color="error"
              disabled={removeDisabled}
              onClick={onRemove}
              sx={Dialogs.removeApproverButtonSx}
            >
              <Close />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      {canViewRequestIsVisible && (
        <Stack direction="row" alignItems="center" sx={trackingControlsSx}>
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
            label="Can track request"
          />
          <IconButton
            aria-label="About tracking a request"
            onClick={(event) => setTrackingInfoAnchor(event.currentTarget)}
          >
            <InfoOutlined fontSize="small" />
          </IconButton>
          <Popover
            open={Boolean(trackingInfoAnchor)}
            anchorEl={trackingInfoAnchor}
            onClose={() => setTrackingInfoAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <Typography sx={trackingInfoSx}>
              This assignee can view the request workflow and follow each
              step's progress.
            </Typography>
          </Popover>
        </Stack>
      )}
    </Stack>
  );
};

export default ApprovalStepApproverRow;
