import { stores } from "@/app/rootStore";
import { EmployeeRole, Tenant, TenantType } from "@/features/tenants/models/tenant";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

const roleLabels = ["User", "Manager", "Admin"];

interface TenantsGridProps {
  currentTenantGlobalId?: string;
}

const TenantsGrid: React.FC<TenantsGridProps> = ({ currentTenantGlobalId }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallDisplay = useMediaQuery(theme.breakpoints.down("sm"));
  const gridLoader = ActionLoaders.grids.tenants();
  const businessTenants = stores.tenantStore.tenants.filter(
    (tenant) => tenant.type === TenantType.Business,
  );
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    businessTenants,
    currentTenantGlobalId,
  );

  const gridIsLoading = useGridRefresh(
    () => stores.tenantStore.load(),
    "tenants",
    gridLoader,
  );

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
      field: "role",
      headerName: "Role",
      ...DataGrids.tenantsColumnSizing.role,
      valueFormatter: (value) => roleLabels[value as EmployeeRole],
    },
    {
      field: "isOwner",
      headerName: "Owner",
      ...DataGrids.tenantsColumnSizing.isOwner,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Owner" size="small" color="primary" />
        ) : null,
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
          role: !isSmallDisplay,
          isOwner: !isSmallDisplay,
        }}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[DataGrids.defaultPageSize]}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          toolbar: customToolbar,
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

export default observer(TenantsGrid);
