import { stores } from "@/app/stores";
import TeamActionsMenu from "@/features/teams/components/TeamActionsMenu";
import TeamDialog from "@/features/teams/components/TeamDialog";
import { Team, UpsertTeamRequest } from "@/features/teams/models/team";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids } from "@/shared/constants/constants";
import { Add } from "@mui/icons-material";
import { Box, Button, LinearProgress } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

const TeamsGrid = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const tenantId = stores.tenantStore.currentTenantId;
  const teamsLoaderPrefix = tenantId ? `api/tenants/${tenantId}/teams` : "";
  const employeesLoaderPrefix = tenantId ? `api/tenants/${tenantId}/users` : "";
  const canModifyTeams =
    stores.tenantStore.currentTenant?.role === EmployeeRole.Admin;

  useEffect(() => {
    stores.teamStore.clear();
    stores.employeeStore.clear();
    if (tenantId) {
      stores.teamStore.load(tenantId);
      stores.employeeStore.load(tenantId);
    }
  }, [tenantId]);

  const openCreateDialog = () => {
    setCurrentTeam(null);
    setDialogIsOpen(true);
  };

  const openEditDialog = (team: Team) => {
    setCurrentTeam(team);
    setDialogIsOpen(true);
  };

  const handleDelete = async (team: Team) => {
    if (!tenantId || !window.confirm(`Delete ${team.name}?`)) {
      return;
    }

    await stores.teamStore.delete(tenantId, team.id);
  };

  const handleSubmit = async (
    payload: UpsertTeamRequest,
    teamId?: number,
  ): Promise<boolean> => {
    if (!tenantId) {
      return false;
    }

    return teamId
      ? await stores.teamStore.update(tenantId, teamId, payload)
      : await stores.teamStore.create(tenantId, payload);
  };

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={openCreateDialog}>
          New team
        </Button>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      ...DataGrids.teamsColumnSizing.name,
    },
    ...(canModifyTeams
      ? [
        {
          field: "action",
          headerName: "Action",
          headerAlign: "right",
          align: "right",
          ...DataGrids.teamsColumnSizing.action,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <TeamActionsMenu
              team={params.row as Team}
              onEdit={openEditDialog}
              onDelete={handleDelete}
            />
          ),
        } as GridColDef,
      ]
      : []),
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={stores.teamStore.teams}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: DataGrids.defaultPageSize,
            },
          },
        }}
        pageSizeOptions={[DataGrids.defaultPageSize]}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          toolbar: canModifyTeams ? customToolbar : undefined,
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        }}
        sx={DataGrids.sx}
        autoHeight
        loading={
          stores.commonStore.isLoading(`get_${teamsLoaderPrefix}`) ||
          stores.commonStore.isLoading(`get_${employeesLoaderPrefix}`) ||
          stores.commonStore.isLoading(`post_${teamsLoaderPrefix}`) ||
          stores.commonStore.isLoadingByPrefix(`put_${teamsLoaderPrefix}/`) ||
          stores.commonStore.isLoadingByPrefix(`delete_${teamsLoaderPrefix}/`)
        }
      />
      {canModifyTeams && (
        <TeamDialog
          open={dialogIsOpen}
          team={currentTeam}
          employees={stores.employeeStore.employees}
          onClose={() => setDialogIsOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  );
};

export default observer(TeamsGrid);
