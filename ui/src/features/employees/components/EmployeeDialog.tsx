import {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import { Team } from "@/features/teams/models/team";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Dialogs, Pages, Validation } from "@/shared/constants/constants";
import {
  Autocomplete,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface EmployeeDialogProps {
  canEdit: boolean;
  employee: Employee | null;
  teams: Team[];
  selectedTeamIds: number[];
  onClose: (currentEmployeeId?: number) => void;
  onDelete: (employeeId: number) => Promise<boolean>;
  onSubmit: (
    payload: CreateEmployeeRequest | UpdateEmployeeRequest,
    teamIds: number[],
    employeeId?: number,
  ) => Promise<Employee | null>;
}

const roleOptions = [
  { label: "User", value: EmployeeRole.User },
  { label: "Manager", value: EmployeeRole.Manager },
  { label: "Admin", value: EmployeeRole.Admin },
];

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  employee,
  teams,
  selectedTeamIds,
  canEdit,
  onClose,
  onDelete,
  onSubmit,
}) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState(EmployeeRole.User);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [emailTouched, setEmailTouched] = useState(false);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const isNew = employee === null;
  const emailHasError =
    isNew && emailTouched && !Validation.emailRegex.test(email);

  useEffect(() => {
    setEmail(employee?.email ?? "");
    setFirstName(employee?.firstName ?? "");
    setLastName(employee?.lastName ?? "");
    setPosition(employee?.position ?? "");
    setRole(employee?.role ?? EmployeeRole.User);
    setSelectedTeams(teams.filter((team) => selectedTeamIds.includes(team.id)));
    setEmailTouched(false);
  }, [employee, teams, selectedTeamIds]);

  const handleSubmit = async () => {
    if (isNew && !Validation.emailRegex.test(email)) {
      setEmailTouched(true);
      return;
    }

    const payload = {
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      position: position.trim() || undefined,
      role,
    };
    const savedEmployee = !isNew
      ? await onSubmit(
        payload,
        selectedTeams.map((team) => team.id),
        employee.id,
      )
      : await onSubmit(
        { ...payload, email: email.trim() },
        selectedTeams.map((team) => team.id),
      );

    if (savedEmployee) {
      onClose(savedEmployee.id);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        {isNew ? "New employee" : "Employee"}
      </Typography>
      <Stack spacing={Dialogs.formStackSpacing}>
        <TextField
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setEmailTouched(true)}
          disabled={!isNew}
          error={emailHasError}
          helperText={
            emailHasError ? "Enter a valid email address." : undefined
          }
          fullWidth
          required
        />
        <TextField
          label="First name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          fullWidth
          disabled={!isNew && !canEdit}
        />
        <TextField
          label="Last name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          fullWidth
          disabled={!isNew && !canEdit}
        />
        <TextField
          label="Position"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          fullWidth
          disabled={!isNew && !canEdit}
        />
        <FormControl fullWidth>
          <InputLabel id="tenant-user-role-label">Role</InputLabel>
          <Select
            labelId="tenant-user-role-label"
            label="Role"
            value={role}
            onChange={(event) => setRole(Number(event.target.value))}
            disabled={!isNew && !canEdit}
          >
            {roleOptions.map((option) => (
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
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_, value) => setSelectedTeams(value)}
          disabled={!isNew && !canEdit}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.name} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Teams"
              helperText="Assign this employee to teams."
            />
          )}
        />
      </Stack>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={Dialogs.stepHeaderSpacing}
        sx={Dialogs.addStepButtonSx}
      >
        <Button variant="outlined" onClick={() => onClose(employee?.id)}>
          Cancel
        </Button>
        {!isNew && canEdit && (
          <Button color="error" variant="outlined" onClick={() => setDeleteDialogIsOpen(true)}>
            Delete
          </Button>
        )}
        {(isNew || canEdit) && (
          <Button variant="outlined" onClick={handleSubmit}>
            Save
          </Button>
        )}
      </Stack>
      {employee && (
        <DeleteConfirmationDialog
          entityName={employee.email}
          open={deleteDialogIsOpen}
          title="Delete employee"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={() => onDelete(employee.id)}
        />
      )}
    </>
  );
};

export default EmployeeDialog;
