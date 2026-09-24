import { stores } from "@/app/rootStore";
import ApprovalRequestParticipantChip from "@/features/approvalRequests/components/ApprovalRequestParticipantChip";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import EmployeeDisplayName from "@/features/employees/components/EmployeeDisplayName";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Forms } from "@/shared/components/dialogs/formStyles";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { FieldLimits } from "@/shared/config/fieldLimits";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getEmployeeDisplayName } from "@/shared/utils/displayNameHelpers";
import { textRule } from "@/shared/utils/formValidation";
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
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const saveLoader = ActionLoaders.teams.save(team?.globalId);
  const saveAction = useAsyncAction(saveLoader);
  const isNew = team === null;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const teamsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/teams") : "/";
  const saveIsLoading = saveAction.isRunning || stores.commonStore.isActionLoading(saveLoader);
  useEffect(() => {
    setName(team?.name ?? "");
    setMembers(team?.members ?? []);
  }, [team]);

  const validation = useFormValidation(
    { name },
    {
      name: textRule("Name", FieldLimits.name, true),
    },
  );

  const handleSubmit = async () => {
    if (!validation.validate()) return;
    if (!canEdit) {
      return;
    }

    await validation.run(() =>
      saveAction.run(async () => {
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
      }),
    );
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
      <Stack spacing={Forms.formStackSpacing}>
        <TextField
          label="Name"
          value={name}
          {...validation.field("name")}
          onChange={(event) => setName(event.target.value)}
          fullWidth
          required
          disabled={!canEdit}
        />
        <Autocomplete
          multiple
          options={employees}
          getOptionDisabled={(employee) => employee.status === EmployeeStatus.Disabled}
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
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Forms.actionSpacing} sx={Forms.addActionSx}>
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
