import { stores } from "@/app/rootStore";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import {
  Autocomplete,
  Button,
  Chip,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

interface TeamDialogProps {
  canEdit: boolean;
  team: Team | null;
  employees: Employee[];
  onClose: (currentTeamGlobalId?: string) => void;
  onDelete: (teamGlobalId: string) => Promise<boolean>;
  onSubmit: (payload: UpsertTeamRequest, teamGlobalId?: string) => Promise<Team | null>;
}

const getEmployeeLabel = (employee: Employee) => {
  return employee.displayName;
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
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const teamsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/teams") : "/";
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
        employeeGlobalIds: members.map((member) => member.globalId),
      },
      team?.globalId,
    );

    if (savedTeam) {
      onClose(savedTeam.globalId);
    }
  };

  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Teams",
            state: team ? { currentTeamGlobalId: team.globalId } : undefined,
            to: teamsPath,
          },
          { label: isNew ? "New team" : "Team" },
        ]}
      />
      <Stack spacing={Dialogs.formStackSpacing}>
        <TextField
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => setNameTouched(true)}
          error={nameHasError}
          helperText={
            nameHasError ? "Team name is required." : undefined
          }
          fullWidth
          required
          disabled={!isNew && !canEdit}
        />
        <Autocomplete
          multiple
          options={activeEmployees}
          value={members}
          getOptionLabel={getEmployeeLabel}
          isOptionEqualToValue={(option, value) => option.globalId === value.globalId}
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
        <Button variant="outlined" onClick={() => onClose(team?.globalId)}>
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
          onDelete={() => onDelete(team.globalId)}
        />
      )}
    </>
  );
};

export default TeamDialog;
