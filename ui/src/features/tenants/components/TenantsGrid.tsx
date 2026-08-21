import { stores } from "@/app/rootStore";
import { EmployeeRole, Tenant, TenantType } from "@/features/tenants/models/tenant";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import { DataGrids } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { Add } from "@mui/icons-material";
import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

const roleLabels: Record<EmployeeRole, string> = {
  [EmployeeRole.User]: "User",
  [EmployeeRole.Admin]: "Admin",
  [EmployeeRole.Owner]: "Owner",
};

interface TenantsGridProps {
  currentTenantGlobalId?: string;
}

const TenantsGrid: React.FC<TenantsGridProps> = ({ currentTenantGlobalId }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallDisplay = useMediaQuery(theme.breakpoints.down("sm"));
  const gridLoader = ActionLoaders.grids.tenants();
  const businessTenants = stores.tenantStore.tenants.filter((tenant) => tenant.type === TenantType.Business);
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(businessTenants, currentTenantGlobalId);

  const gridIsLoading = useGridRefresh(() => stores.tenantStore.load(), "tenants", gridLoader);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={() => navigate("/tenants/new")}>
          New organization
        </Button>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "businessName",
      headerName: "Name",
      ...DataGrids.tenantsColumnSizing.businessName,
    },
    {
      field: "currentEmployeeRole",
      headerName: "Role",
      ...DataGrids.tenantsColumnSizing.currentEmployeeRole,
      valueFormatter: (value) => roleLabels[value as EmployeeRole],
    },
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={businessTenants}
        getRowId={(row) => row.globalId}
        columns={columns}
        rowSelectionModel={currentTenantGlobalId === undefined ? [] : [currentTenantGlobalId]}
        hideFooterSelectedRowCount
        onRowClick={(params) => navigate(`/tenants/${(params.row as Tenant).globalId}`)}
        columnVisibilityModel={{
          currentEmployeeRole: !isSmallDisplay,
        }}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={DataGrids.pageSizeOptions}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          loadingOverlay: NoLoadingOverlay,
          toolbar: customToolbar,
          noRowsOverlay: NoRowsOverlay,
        }}
        sx={DataGrids.sx}
        autoHeight
        loading={gridIsLoading}
      />
    </Box>
  );
};

export default observer(TenantsGrid);
