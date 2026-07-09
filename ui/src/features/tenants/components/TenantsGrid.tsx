import { stores } from "@/app/stores";
import TenantActionsMenu from "@/features/tenants/components/TenantActionsMenu";
import TenantDialog from "@/features/tenants/components/TenantDialog";
import {
  CreateTenantRequest,
  EmployeeRole,
  Tenant,
  TenantType,
  UpdateTenantRequest,
} from "@/features/tenants/models/tenant";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids } from "@/shared/constants/constants";
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

const roleLabels = ["User", "Manager", "Admin"];

const TenantsGrid = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const tenantsLoaderPrefix = "api/tenants";
  const businessTenants = stores.tenantStore.tenants.filter(
    (tenant) => tenant.type === TenantType.Business,
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

  const openEditDialog = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    setDialogIsOpen(true);
  };

  const refreshTenantScopedStores = async () => {
    stores.approvalRequestStore.clear();
    stores.approvalRequestTaskStore.clear();
    stores.employeeStore.clear();
    if (stores.tenantStore.currentTenantId) {
      await stores.approvalRequestStore.load();
      await stores.approvalRequestTaskStore.loadUncompletedCount();
    }
  };

  const handleDelete = async (tenant: Tenant) => {
    if (!window.confirm(`Delete ${tenant.businessName}?`)) {
      return;
    }

    const deleted = await stores.tenantStore.delete(tenant.id);
    if (deleted) {
      await refreshTenantScopedStores();
    }
  };

  const handleSubmit = async (
    payload: CreateTenantRequest | UpdateTenantRequest,
    tenantId?: number,
  ): Promise<Tenant | null> => {
    const tenant = tenantId
      ? await stores.tenantStore.update(tenantId, payload as UpdateTenantRequest)
      : await stores.tenantStore.create(payload as CreateTenantRequest);
    if (tenant && !tenantId) {
      await refreshTenantScopedStores();
    }

    return tenant;
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
      ...DataGrids.tenantsColumnSizing.businessName,
    },
    {
      field: "email",
      headerName: "Email",
      ...DataGrids.tenantsColumnSizing.email,
    },
    {
      field: "phone",
      headerName: "Phone",
      ...DataGrids.tenantsColumnSizing.phone,
    },
    {
      field: "websiteUrl",
      headerName: "Website",
      ...DataGrids.tenantsColumnSizing.websiteUrl,
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
    {
      field: "action",
      headerName: "Action",
      headerAlign: "right",
      align: "right",
      ...DataGrids.tenantsColumnSizing.action,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const tenant = params.row as Tenant;
        if (tenant.role !== EmployeeRole.Admin && !tenant.isOwner) {
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
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={businessTenants}
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
      <TenantDialog
        open={dialogIsOpen}
        tenant={currentTenant}
        onClose={() => setDialogIsOpen(false)}
        onSubmit={handleSubmit}
        onLogoUpload={stores.tenantStore.uploadLogo}
        onLogoDelete={stores.tenantStore.deleteLogo}
      />
    </Box>
  );
};

export default observer(TenantsGrid);
