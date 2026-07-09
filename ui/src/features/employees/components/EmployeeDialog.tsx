import {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import { Team } from "@/features/teams/models/team";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import { Dialogs, Validation } from "@/shared/constants/constants";
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

interface EmployeeDialogProps {
  open: boolean;
  employee: Employee | null;
  teams: Team[];
  selectedTeamIds: number[];
  onClose: () => void;
  onSubmit: (
    payload: CreateEmployeeRequest | UpdateEmployeeRequest,
    teamIds: number[],
    employeeId?: number,
  ) => Promise<boolean>;
}

const roleOptions = [
  { label: "User", value: EmployeeRole.User },
  { label: "Manager", value: EmployeeRole.Manager },
  { label: "Admin", value: EmployeeRole.Admin },
];

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  open,
  employee,
  teams,
  selectedTeamIds,
  onClose,
  onSubmit,
}) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState(EmployeeRole.User);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [emailTouched, setEmailTouched] = useState(false);
  const isEdit = employee !== null;
  const emailHasError =
    !isEdit && emailTouched && !Validation.emailRegex.test(email);

  useEffect(() => {
    if (!open) {
      return;
    }

    setEmail(employee?.email ?? "");
    setFirstName(employee?.firstName ?? "");
    setLastName(employee?.lastName ?? "");
    setPosition(employee?.position ?? "");
    setRole(employee?.role ?? EmployeeRole.User);
    setSelectedTeams(teams.filter((team) => selectedTeamIds.includes(team.id)));
    setEmailTouched(false);
  }, [open, employee, teams, selectedTeamIds]);

  const handleSubmit = async () => {
    if (!isEdit && !Validation.emailRegex.test(email)) {
      setEmailTouched(true);
      return;
    }

    const payload = {
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      position: position.trim() || undefined,
      role,
    };
    const saved = isEdit
      ? await onSubmit(
        payload,
        selectedTeams.map((team) => team.id),
        employee.id,
      )
      : await onSubmit(
        { ...payload, email: email.trim() },
        selectedTeams.map((team) => team.id),
      );

    if (saved) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={Dialogs.tenantMaxWidth}
    >
      <DialogTitle>{isEdit ? "Edit employee" : "Add employee"}</DialogTitle>
      <DialogContent>
        <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.topSpacingSx}>
          <TextField
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setEmailTouched(true)}
            disabled={isEdit}
            error={emailHasError}
            helperText={emailHasError ? "Enter a valid email address." : " "}
            fullWidth
            required
          />
          <TextField
            label="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            fullWidth
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            fullWidth
          />
          <TextField
            label="Position"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="tenant-user-role-label">Role</InputLabel>
            <Select
              labelId="tenant-user-role-label"
              label="Role"
              value={role}
              onChange={(event) => setRole(Number(event.target.value))}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeDialog;
