import { stores } from "@/app/rootStore";
import { Team } from "@/features/teams/models/team";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
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
  currentTeamGlobalId?: string;
}

const TeamsGrid: React.FC<TeamsGridProps> = ({ currentTeamGlobalId }) => {
  const navigate = useNavigate();
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const gridLoader = ActionLoaders.grids.teams(tenantGlobalId);
  const canModifyTeams =
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Admin ||
    stores.tenantStore.currentTenant?.isCurrentEmployeeOwner === true;
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.teamStore.teams,
    currentTeamGlobalId,
  );

  useEffect(() => {
    stores.teamStore.clear();
    stores.employeeStore.clear();
  }, [tenantGlobalId]);

  const gridIsLoading = useGridRefresh(() => {
    if (tenantGlobalId) {
      return Promise.all([
        stores.teamStore.load(tenantGlobalId, true),
        stores.employeeStore.load(tenantGlobalId, true),
      ]).then(() => undefined);
    }
  }, tenantGlobalId, gridLoader);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={() => navigate(Routes.tenantPath(tenantGlobalId!, "/teams/new"))}
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
        getRowId={(row) => row.globalId}
        columns={columns}
        rowSelectionModel={currentTeamGlobalId === undefined ? [] : [currentTeamGlobalId]}
        hideFooterSelectedRowCount
        onRowClick={(params) =>
          navigate(Routes.tenantPath(tenantGlobalId!, `/teams/${(params.row as Team).globalId}`))
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
        loading={gridIsLoading}
      />
    </Box>
  );
};

export default observer(TeamsGrid);
