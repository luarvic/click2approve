import {
  ApprovalRequestSharePermission,
  UpsertApprovalRequestShare,
} from "@/features/approvalRequests/models/approvalRequestShare";
import { Employee } from "@/features/employees/models/employee";
import { getEmployeeDisplayName } from "@/features/employees/utils/employeeLabels";
import { Dialogs } from "@/shared/constants/constants";
import { Close } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Autocomplete,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalRequestSharingProps {
  canManage?: boolean;
  employees: Employee[];
  shares: EditableApprovalRequestShare[];
  teams: { id: number; name: string }[];
  onSharesChange: (shares: EditableApprovalRequestShare[]) => void;
}

export type EditableApprovalRequestShare = UpsertApprovalRequestShare & {
  key: string;
  targetType: "employee" | "team";
};

const shareRowSx: SxProps<Theme> = {
  alignItems: { xs: "stretch", sm: "center" },
};
const targetTypeFieldSx: SxProps<Theme> = {
  minWidth: 220,
  width: { xs: "100%", sm: "auto" },
};
const shareFieldSx: SxProps<Theme> = {
  flexGrow: 1,
  minWidth: 0,
  width: { xs: "100%", sm: "auto" },
};
const permissionFieldSx: SxProps<Theme> = {
  minWidth: 150,
  width: { xs: "100%", sm: "auto" },
};
const removeButtonSx: SxProps<Theme> = { alignSelf: { xs: "flex-end", sm: "center" } };
const actionButtonSx: SxProps<Theme> = { alignSelf: "flex-start" };

const createShare = (): EditableApprovalRequestShare => ({
  key: crypto.randomUUID(),
  targetType: "employee",
  permission: ApprovalRequestSharePermission.ReadOnly,
});

const ApprovalRequestSharing: React.FC<ApprovalRequestSharingProps> = ({
  canManage = true,
  employees,
  shares,
  teams,
  onSharesChange,
}) => {
  const updateShare = (
    key: string,
    update: (share: EditableApprovalRequestShare) => EditableApprovalRequestShare,
  ) => {
    onSharesChange(
      shares.map((share) => (share.key === key ? update(share) : share)),
    );
  };

  return (
    <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
      {shares.map((share) => (
        <Stack
          key={share.key}
          direction={{ xs: "column", sm: "row" }}
          spacing={Dialogs.stepHeaderSpacing}
          sx={shareRowSx}
        >
          <TextField
            select
            label="Share with"
            value={share.targetType}
            disabled={!canManage}
            onChange={(event) =>
              updateShare(share.key, (current) => ({
                ...current,
                employeeId: undefined,
                targetType: event.target.value as "employee" | "team",
                teamId: undefined,
              }))
            }
            sx={targetTypeFieldSx}
          >
            <MenuItem value="employee">Employee</MenuItem>
            <MenuItem value="team">Team</MenuItem>
          </TextField>
          {share.targetType === "employee" ? (
            <Autocomplete
              fullWidth
              disabled={!canManage}
              options={employees}
              getOptionLabel={getEmployeeDisplayName}
              value={
                employees.find((employee) => employee.id === share.employeeId) ?? null
              }
              renderInput={(params) => <TextField {...params} label="Employee" />}
              onChange={(_, value) =>
                updateShare(share.key, (current) => ({
                  ...current,
                  employeeId: value?.id,
                }))
              }
              sx={shareFieldSx}
            />
          ) : (
            <Autocomplete
              fullWidth
              disabled={!canManage}
              options={teams}
              getOptionLabel={(team) => team.name}
              value={teams.find((team) => team.id === share.teamId) ?? null}
              renderInput={(params) => <TextField {...params} label="Team" />}
              onChange={(_, value) =>
                updateShare(share.key, (current) => ({
                  ...current,
                  teamId: value?.id,
                }))
              }
              sx={shareFieldSx}
            />
          )}
          <TextField
            select
            label="Permission"
            value={share.permission}
            disabled={!canManage}
            onChange={(event) =>
              updateShare(share.key, (current) => ({
                ...current,
                permission: Number(event.target.value) as ApprovalRequestSharePermission,
              }))
            }
            sx={permissionFieldSx}
          >
            <MenuItem value={ApprovalRequestSharePermission.ReadOnly}>Read-only</MenuItem>
            <MenuItem value={ApprovalRequestSharePermission.FullAccess}>Full access</MenuItem>
          </TextField>
          <Tooltip title="Remove share">
            <IconButton
              aria-label="Remove share"
              color="error"
              disabled={!canManage}
              onClick={() =>
                onSharesChange(shares.filter((item) => item.key !== share.key))
              }
              sx={removeButtonSx}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </Stack>
      ))}
      {canManage && (
        <Button
          sx={actionButtonSx}
          onClick={() => onSharesChange([...shares, createShare()])}
        >
          + Add access
        </Button>
      )}
    </Stack>
  );
};

export default ApprovalRequestSharing;
