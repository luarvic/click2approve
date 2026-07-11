import { stores } from "@/app/rootStore";
import { Team } from "@/features/teams/models/team";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { Add } from "@mui/icons-material";
import { Box, Button, LinearProgress } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface TeamsGridProps {
  currentTeamId?: number;
}

const TeamsGrid: React.FC<TeamsGridProps> = ({ currentTeamId }) => {
  const navigate = useNavigate();
  const tenantId = stores.tenantStore.currentTenantId;
  const teamsLoaderPrefix = tenantId ? `api/tenants/${tenantId}/teams` : "";
  const employeesLoaderPrefix = tenantId ? `api/tenants/${tenantId}/users` : "";
  const canModifyTeams =
    stores.tenantStore.currentTenant?.role === EmployeeRole.Admin ||
    stores.tenantStore.currentTenant?.isOwner === true;
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.teamStore.teams,
    currentTeamId,
  );

  useEffect(() => {
    stores.teamStore.clear();
    stores.employeeStore.clear();
    if (tenantId) {
      stores.teamStore.load(tenantId);
      stores.employeeStore.load(tenantId);
    }
  }, [tenantId]);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={() => navigate(Routes.tenantPath(tenantId!, "/teams/new"))}
        >
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
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={stores.teamStore.teams}
        columns={columns}
        rowSelectionModel={currentTeamId === undefined ? [] : [currentTeamId]}
        onRowClick={(params) =>
          navigate(Routes.tenantPath(tenantId!, `/teams/${(params.row as Team).id}`))
        }
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
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
    </Box>
  );
};

export default observer(TeamsGrid);
