import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { getEmployeeDisplayName } from "@/features/employees/utils/employeeLabels";
import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Dialogs, Pages } from "@/shared/constants/constants";
import {
  Autocomplete,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface TeamDialogProps {
  canEdit: boolean;
  team: Team | null;
  employees: Employee[];
  onClose: (currentTeamId?: number) => void;
  onDelete: (teamId: number) => Promise<boolean>;
  onSubmit: (payload: UpsertTeamRequest, teamId?: number) => Promise<Team | null>;
}

const getEmployeeLabel = (employee: Employee) => {
  return getEmployeeDisplayName(employee);
};

const TeamDialog: React.FC<TeamDialogProps> = ({
  team,
  employees,
  canEdit,
  onClose,
  onDelete,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [members, setMembers] = useState<Employee[]>([]);
  const [nameTouched, setNameTouched] = useState(false);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const isNew = team === null;
  const activeEmployees = employees.filter(
    (employee) => employee.status === EmployeeStatus.Active,
  );
  const nameHasError = nameTouched && !name.trim();

  useEffect(() => {
    setName(team?.name ?? "");
    setMembers(team?.members ?? []);
    setNameTouched(false);
  }, [team]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameTouched(true);
      return;
    }

    const savedTeam = await onSubmit(
      {
        name: name.trim(),
        employeeIds: members.map((member) => member.id),
      },
      team?.id,
    );

    if (savedTeam) {
      onClose(savedTeam.id);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        {isNew ? "New team" : "Team"}
      </Typography>
      <Stack spacing={Dialogs.formStackSpacing}>
        <TextField
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => setNameTouched(true)}
          error={nameHasError}
          helperText={nameHasError ? "Team name is required." : " "}
          fullWidth
          required
          disabled={!isNew && !canEdit}
        />
        <Autocomplete
          multiple
          options={activeEmployees}
          value={members}
          getOptionLabel={getEmployeeLabel}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_, value) => setMembers(value)}
          disabled={!isNew && !canEdit}
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={Dialogs.stepHeaderSpacing}
        sx={Dialogs.addStepButtonSx}
      >
        <Button variant="outlined" onClick={() => onClose(team?.id)}>
          Cancel
        </Button>
        {!isNew && canEdit && (
          <Button
            color="error"
            variant="outlined"
            onClick={() => setDeleteDialogIsOpen(true)}
          >
            Delete
          </Button>
        )}
        {(isNew || canEdit) && (
          <Button variant="outlined" onClick={handleSubmit}>
            Save
          </Button>
        )}
      </Stack>
      {team && (
        <DeleteConfirmationDialog
          entityName={team.name}
          open={deleteDialogIsOpen}
          title="Delete team"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={() => onDelete(team.id)}
        />
      )}
    </>
  );
};

export default TeamDialog;
