import { Add } from "@mui/icons-material";
import { Box, Button, Chip, LinearProgress } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import {
  DATA_GRID_CONTAINER_SX,
  DATA_GRID_DEFAULT_PAGE_SIZE,
  DATA_GRID_SX,
  TENANTS_GRID_COLUMN_SIZING,
} from "../../data/constants";
import {
  ITenant,
  ITenantCreate,
  ITenantUpdate,
  TenantType,
  TenantUserRole,
} from "../../models/tenant";
import { stores } from "../../stores/stores";
import TenantDialog from "../dialogs/TenantDialog";
import TenantActionsMenu from "../menus/TenantActionsMenu";
import NoRowsOverlay from "../overlays/NoRowsOverlay";

const roleLabels = ["User", "Manager", "Admin"];

const TenantsGrid = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<ITenant | null>(null);
  const tenantsLoaderPrefix = "api/tenants";
  const businessTenants = stores.tenantStore.tenants.filter(
    (tenant) => tenant.type === TenantType.Business
  );

  useEffect(() => {
    if (!stores.tenantStore.hasLoaded) {
      stores.tenantStore.load();
    }
  }, []);

  const openCreateDialog = () => {
    setCurrentTenant(null);
    setDialogIsOpen(true);
  };

  const openEditDialog = (tenant: ITenant) => {
    setCurrentTenant(tenant);
    setDialogIsOpen(true);
  };

  const refreshTenantScopedStores = async () => {
    stores.userFileStore.clearUserFiles();
    stores.approvalRequestStore.clearApprovalRequests();
    stores.approvalRequestTaskStore.clearTasks();
    stores.tenantUserStore.clear();
    if (stores.tenantStore.currentTenantId) {
      await stores.userFileStore.loadUserFiles();
      await stores.approvalRequestStore.loadApprovalRequests();
      await stores.approvalRequestTaskStore.loadNumberOfUncompletedTasks();
    }
  };

  const handleDelete = async (tenant: ITenant) => {
    if (!window.confirm(`Delete ${tenant.businessName}?`)) {
      return;
    }

    const deleted = await stores.tenantStore.delete(tenant.id);
    if (deleted) {
      await refreshTenantScopedStores();
    }
  };

  const handleSubmit = async (
    payload: ITenantCreate | ITenantUpdate,
    tenantId?: number
  ): Promise<boolean> => {
    const saved = tenantId
      ? await stores.tenantStore.update(tenantId, payload as ITenantUpdate)
      : await stores.tenantStore.create(payload as ITenantCreate);
    if (saved && !tenantId) {
      await refreshTenantScopedStores();
    }

    return saved;
  };

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={openCreateDialog}>
          New organization
        </Button>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "businessName",
      headerName: "Organization",
      ...TENANTS_GRID_COLUMN_SIZING.businessName,
    },
    {
      field: "email",
      headerName: "Email",
      ...TENANTS_GRID_COLUMN_SIZING.email,
    },
    {
      field: "phone",
      headerName: "Phone",
      ...TENANTS_GRID_COLUMN_SIZING.phone,
    },
    {
      field: "websiteUrl",
      headerName: "Website",
      ...TENANTS_GRID_COLUMN_SIZING.websiteUrl,
    },
    {
      field: "role",
      headerName: "Role",
      ...TENANTS_GRID_COLUMN_SIZING.role,
      valueFormatter: (value) => roleLabels[value as TenantUserRole],
    },
    {
      field: "isOwner",
      headerName: "Owner",
      ...TENANTS_GRID_COLUMN_SIZING.isOwner,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Owner" size="small" color="primary" />
        ) : null,
    },
    {
      field: "action",
      headerName: "Action",
      headerAlign: "right",
      align: "right",
      ...TENANTS_GRID_COLUMN_SIZING.action,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const tenant = params.row as ITenant;
        if (tenant.role !== TenantUserRole.Admin && !tenant.isOwner) {
          return null;
        }

        return (
          <TenantActionsMenu
            tenant={tenant}
            onEdit={openEditDialog}
            onDelete={handleDelete}
          />
        );
      },
    },
  ];

  return (
    <Box sx={DATA_GRID_CONTAINER_SX}>
      <DataGrid
        rows={businessTenants}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: DATA_GRID_DEFAULT_PAGE_SIZE,
            },
          },
        }}
        pageSizeOptions={[DATA_GRID_DEFAULT_PAGE_SIZE]}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          toolbar: customToolbar,
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        }}
        sx={DATA_GRID_SX}
        autoHeight
        loading={
          stores.commonStore.isLoading(`get_${tenantsLoaderPrefix}`) ||
          stores.commonStore.isLoading(`post_${tenantsLoaderPrefix}`) ||
          stores.commonStore.isLoadingByPrefix(`put_${tenantsLoaderPrefix}/`) ||
          stores.commonStore.isLoadingByPrefix(`delete_${tenantsLoaderPrefix}/`)
        }
      />
      <TenantDialog
        open={dialogIsOpen}
        tenant={currentTenant}
        onClose={() => setDialogIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default observer(TenantsGrid);
