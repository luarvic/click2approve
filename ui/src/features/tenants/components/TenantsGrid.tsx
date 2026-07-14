import { stores } from "@/app/rootStore";
import { EmployeeRole, Tenant, TenantType } from "@/features/tenants/models/tenant";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
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
  currentTenantId?: number;
}

const TenantsGrid: React.FC<TenantsGridProps> = ({ currentTenantId }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallDisplay = useMediaQuery(theme.breakpoints.down("sm"));
  const tenantsLoaderPrefix = "api/tenants";
  const businessTenants = stores.tenantStore.tenants.filter(
    (tenant) => tenant.type === TenantType.Business,
  );
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    businessTenants,
    currentTenantId,
  );

  useGridRefresh(() => stores.tenantStore.load(), "tenants");

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
        columns={columns}
        rowSelectionModel={currentTenantId === undefined ? [] : [currentTenantId]}
        onRowClick={(params) => navigate(`/tenants/${(params.row as Tenant).id}`)}
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
        loading={
          stores.commonStore.isLoading(`get_${tenantsLoaderPrefix}`) ||
          stores.commonStore.isLoading(`post_${tenantsLoaderPrefix}`) ||
          stores.commonStore.isLoadingByPrefix(`put_${tenantsLoaderPrefix}/`) ||
          stores.commonStore.isLoadingByPrefix(`delete_${tenantsLoaderPrefix}/`)
        }
      />
    </Box>
  );
};

export default observer(TenantsGrid);
