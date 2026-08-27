import { stores } from "@/app/rootStore";
import {
  CreateEmployeeRequest,
  Employee,
  EmployeeStatus,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import ApprovalRequestParticipantChip from "@/features/approvalRequests/components/ApprovalRequestParticipantChip";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { Team } from "@/features/teams/models/team";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes, Validation } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getEmployeeDisplayName } from "@/shared/utils/displayNameHelpers";
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

interface EmployeeDialogProps {
  canEdit: boolean;
  canTransferOwnership: boolean;
  employee: Employee | null;
  teams: Team[];
  selectedTeamGlobalIds: string[];
  onClose: (currentEmployeeGlobalId?: string) => void;
  onDelete: (employeeGlobalId: string) => Promise<boolean>;
  onSubmit: (
    payload: CreateEmployeeRequest | UpdateEmployeeRequest,
    employeeGlobalId?: string,
  ) => Promise<Employee | null>;
}

const roleOptions = [
  { label: "User", value: EmployeeRole.User },
  { label: "Admin", value: EmployeeRole.Admin },
];

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  employee,
  teams,
  selectedTeamGlobalIds,
  canEdit,
  canTransferOwnership,
  onClose,
  onDelete,
  onSubmit,
}) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState(EmployeeRole.User);
  const [isActive, setIsActive] = useState(true);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [emailTouched, setEmailTouched] = useState(false);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [disableDialogIsOpen, setDisableDialogIsOpen] = useState(false);
  const [ownershipTransferDialogIsOpen, setOwnershipTransferDialogIsOpen] = useState(false);
  const saveLoader = ActionLoaders.employees.save(employee?.globalId);
  const saveAction = useAsyncAction(saveLoader);
  const isNew = employee === null;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const employeesPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/employees") : "/";
  const emailHasError = isNew && emailTouched && !Validation.emailRegex.test(email);
  const saveIsLoading = saveAction.isRunning || stores.commonStore.isActionLoading(saveLoader);
  const availableRoleOptions = [
    ...roleOptions,
    ...(employee?.role === EmployeeRole.Owner || (canTransferOwnership && !isNew)
      ? [{ label: "Owner", value: EmployeeRole.Owner }]
      : []),
  ];

  useEffect(() => {
    setEmail(employee?.email ?? "");
    setFirstName(employee?.firstName ?? "");
    setLastName(employee?.lastName ?? "");
    setPosition(employee?.position ?? "");
    setRole(employee?.role ?? EmployeeRole.User);
    setIsActive(employee?.status === EmployeeStatus.Active);
    setSelectedTeams(teams.filter((team) => selectedTeamGlobalIds.includes(team.globalId)));
    setEmailTouched(false);
  }, [employee, teams, selectedTeamGlobalIds]);

  const saveEmployee = async () => {
    const payload = {
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      position: position.trim() || undefined,
      role,
      ...(!isNew ? { isActive } : {}),
      teamGlobalIds: selectedTeams.map((team) => team.globalId),
    };
    return (
      (await saveAction.run(async () => {
        const savedEmployee = !isNew
          ? await onSubmit(payload, employee.globalId)
          : await onSubmit({ ...payload, email: email.trim() });

        if (savedEmployee) {
          onClose(savedEmployee.globalId);
        }

        return savedEmployee !== null;
      })) ?? false
    );
  };

  const handleSubmit = async () => {
    if (!canEdit) {
      return;
    }

    if (isNew && !Validation.emailRegex.test(email)) {
      setEmailTouched(true);
      return;
    }

    if (!isNew && employee.role !== EmployeeRole.Owner && role === EmployeeRole.Owner) {
      setOwnershipTransferDialogIsOpen(true);
      return;
    }

    if (!isNew && employee.status === EmployeeStatus.Active && !isActive) {
      setDisableDialogIsOpen(true);
      return;
    }

    await saveEmployee();
  };

  return (
    <CloseOnEscape onClose={() => onClose(employee?.globalId)}>
      <PageBreadcrumbs
        items={[
          {
            label: "Employees",
            state: employee ? { currentEmployeeGlobalId: employee.globalId } : undefined,
            to: employeesPath,
          },
          { label: employee ? getEmployeeDisplayName(employee) : "New employee" },
        ]}
      />
      <Stack spacing={Dialogs.formStackSpacing}>
        <TextField
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setEmailTouched(true)}
          disabled={!isNew || !canEdit}
          error={emailHasError}
          helperText={emailHasError ? "Enter a valid email address." : undefined}
          fullWidth
          required
        />
        <TextField
          label="First name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          fullWidth
          disabled={!canEdit}
        />
        <TextField
          label="Last name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          fullWidth
          disabled={!canEdit}
        />
        <TextField
          label="Position"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          fullWidth
          disabled={!canEdit}
        />
        <FormControl fullWidth>
          <InputLabel id="tenant-user-role-label">Role</InputLabel>
          <Select
            labelId="tenant-user-role-label"
            label="Role"
            value={role}
            onChange={(event) => setRole(Number(event.target.value))}
            disabled={!canEdit || (!isNew && employee.role === EmployeeRole.Owner)}
          >
            {availableRoleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Autocomplete
          multiple
          options={teams}
          value={selectedTeams}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.globalId === value.globalId}
          onChange={(_, value) => setSelectedTeams(value)}
          disabled={!canEdit}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <ApprovalRequestParticipantChip
                {...getTagProps({ index })}
                displayName={option.name}
                type={AssigneeType.Team}
              />
            ))
          }
          renderInput={(params) => <TextField {...params} label="Teams" helperText="Assign this employee to teams." />}
        />
        {!isNew && employee.status !== EmployeeStatus.Pending && (
          <FormControlLabel
            control={
              <Checkbox
                checked={isActive}
                disabled={!canEdit || employee.role === EmployeeRole.Owner}
                onChange={(event) => setIsActive(event.target.checked)}
              />
            }
            label="Active"
          />
        )}
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.addStepButtonSx}>
        <Button variant="outlined" onClick={() => onClose(employee?.globalId)}>
          Cancel
        </Button>
        {!isNew && canEdit && employee?.role !== EmployeeRole.Owner && (
          <Button color="error" variant="outlined" onClick={() => setDeleteDialogIsOpen(true)}>
            Delete
          </Button>
        )}
        {canEdit && (
          <MainActionButton loading={saveIsLoading} onClick={handleSubmit}>
            Save
          </MainActionButton>
        )}
      </Stack>
      {employee && (
        <DeleteConfirmationDialog
          entityName={employee.email}
          open={deleteDialogIsOpen}
          title="Delete employee"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={() => onDelete(employee.globalId)}
        />
      )}
      <ConfirmationDialog
        cancelLabel="Keep current owner"
        confirmColor="warning"
        confirmLabel="Transfer ownership"
        message={
          <>
            You are transferring ownership of this organization. You will become an Admin and will not be able to
            transfer ownership back yourself.
          </>
        }
        open={ownershipTransferDialogIsOpen}
        title="Transfer organization ownership?"
        onClose={() => setOwnershipTransferDialogIsOpen(false)}
        onConfirm={saveEmployee}
      />
      <ConfirmationDialog
        cancelLabel="Keep employee active"
        confirmColor="warning"
        confirmLabel="Disable employee"
        message={
          <>
            This employee will immediately lose access to this organization and will no longer appear when selecting
            employees. Existing tasks, requests, team memberships, and delegations will be retained.
          </>
        }
        open={disableDialogIsOpen}
        title="Disable employee?"
        onClose={() => setDisableDialogIsOpen(false)}
        onConfirm={saveEmployee}
      />
    </CloseOnEscape>
  );
};

export default EmployeeDialog;
