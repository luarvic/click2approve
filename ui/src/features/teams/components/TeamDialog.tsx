import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { getEmployeeDisplayName } from "@/features/employees/utils/employeeLabels";
import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
import { Dialogs } from "@/shared/constants/constants";
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

interface TeamDialogProps {
  open: boolean;
  team: Team | null;
  employees: Employee[];
  onClose: () => void;
  onSubmit: (payload: UpsertTeamRequest, teamId?: number) => Promise<boolean>;
}

const getEmployeeLabel = (employee: Employee) => {
  return getEmployeeDisplayName(employee);
};

const TeamDialog: React.FC<TeamDialogProps> = ({
  open,
  team,
  employees,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [members, setMembers] = useState<Employee[]>([]);
  const [nameTouched, setNameTouched] = useState(false);
  const isEdit = team !== null;
  const activeEmployees = employees.filter(
    (employee) => employee.status === EmployeeStatus.Active,
  );
  const nameHasError = nameTouched && !name.trim();

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(team?.name ?? "");
    setMembers(team?.members ?? []);
    setNameTouched(false);
  }, [open, team]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameTouched(true);
      return;
    }

    const saved = await onSubmit(
      {
        name: name.trim(),
        employeeIds: members.map((member) => member.id),
      },
      team?.id,
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
      <DialogTitle>{isEdit ? "Edit team" : "Add team"}</DialogTitle>
      <DialogContent>
        <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.topSpacingSx}>
          <TextField
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setNameTouched(true)}
            error={nameHasError}
            helperText={nameHasError ? "Team name is required." : " "}
            fullWidth
            required
          />
          <Autocomplete
            multiple
            options={activeEmployees}
            value={members}
            getOptionLabel={getEmployeeLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, value) => setMembers(value)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={getEmployeeLabel(option)}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Employees"
                helperText="Assign active employees to this team."
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

export default TeamDialog;
