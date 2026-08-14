import { stores } from "@/app/rootStore";
import { Employee } from "@/features/employees/models/employee";
import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import DisplayName from "@/shared/components/identity/DisplayName";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import LoadingButton from "@mui/lab/LoadingButton";
import { Autocomplete, Button, Chip, Stack, TextField } from "@mui/material";
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

const TeamDialog: React.FC<TeamDialogProps> = ({ team, employees, canEdit, onClose, onDelete, onSubmit }) => {
  const [name, setName] = useState("");
  const [members, setMembers] = useState<Employee[]>([]);
  const [nameTouched, setNameTouched] = useState(false);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const saveLoader = ActionLoaders.teams.save(team?.globalId);
  const saveAction = useAsyncAction(saveLoader);
  const isNew = team === null;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const teamsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/teams") : "/";
  const nameHasError = nameTouched && !name.trim();
  const saveIsLoading = saveAction.isRunning || stores.commonStore.isActionLoading(saveLoader);

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

    await saveAction.run(async () => {
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
    });
  };

  return (
    <CloseOnEscape onClose={() => onClose(team?.globalId)}>
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
          helperText={nameHasError ? "Team name is required." : undefined}
          fullWidth
          required
          disabled={!isNew && !canEdit}
        />
        <Autocomplete
          multiple
          options={employees}
          value={members}
          getOptionLabel={getEmployeeLabel}
          isOptionEqualToValue={(option, value) => option.globalId === value.globalId}
          onChange={(_, value) => setMembers(value)}
          disabled={!isNew && !canEdit}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip label={getEmployeeLabel(option)} {...getTagProps({ index })} />)
          }
          renderInput={(params) => (
            <TextField {...params} label="Employees" helperText="Assign employees to this team." />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <DisplayName displayName={option.displayName} email={option.email} />
            </li>
          )}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.addStepButtonSx}>
        <Button variant="outlined" onClick={() => onClose(team?.globalId)}>
          Cancel
        </Button>
        {!isNew && canEdit && (
          <Button color="error" variant="outlined" onClick={() => setDeleteDialogIsOpen(true)}>
            Delete
          </Button>
        )}
        {(isNew || canEdit) && (
          <LoadingButton loading={saveIsLoading} variant="outlined" onClick={handleSubmit}>
            Save
          </LoadingButton>
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
    </CloseOnEscape>
  );
};

export default TeamDialog;
