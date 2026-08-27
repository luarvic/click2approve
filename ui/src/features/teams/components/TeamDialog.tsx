import { stores } from "@/app/rootStore";
import EmployeeDisplayName from "@/features/employees/components/EmployeeDisplayName";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import ApprovalRequestParticipantChip from "@/features/approvalRequests/components/ApprovalRequestParticipantChip";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getEmployeeDisplayName } from "@/shared/utils/displayNameHelpers";
import { Autocomplete, Button, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";

interface TeamDialogProps {
  canEdit: boolean;
  team: Team | null;
  employees: Employee[];
  onClose: (currentTeamGlobalId?: string) => void;
  onDelete: (teamGlobalId: string) => Promise<boolean>;
  onSubmit: (payload: UpsertTeamRequest, teamGlobalId?: string) => Promise<Team | null>;
}

const getEmployeeLabel = (employee: Employee) => getEmployeeDisplayName(employee);

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
  const activeEmployees = employees.filter(
    (employee) => employee.status === undefined || employee.status === EmployeeStatus.Active,
  );

  useEffect(() => {
    setName(team?.name ?? "");
    setMembers(team?.members ?? []);
    setNameTouched(false);
  }, [team]);

  const handleSubmit = async () => {
    if (!canEdit) {
      return;
    }

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
          { label: team?.name ?? "New team" },
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
          disabled={!canEdit}
        />
        <Autocomplete
          multiple
          options={activeEmployees}
          value={members}
          getOptionLabel={getEmployeeLabel}
          isOptionEqualToValue={(option, value) => option.globalId === value.globalId}
          onChange={(_, value) => setMembers(value)}
          disabled={!canEdit}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <ApprovalRequestParticipantChip
                {...getTagProps({ index })}
                displayName={getEmployeeDisplayName(option)}
                email={option.email}
                employeeStatus={option.status}
                type={AssigneeType.Employee}
              />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} label="Employees" helperText="Assign employees to this team." />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <EmployeeDisplayName employee={option} />
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
        {canEdit && (
          <MainActionButton loading={saveIsLoading} onClick={handleSubmit}>
            Save
          </MainActionButton>
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
