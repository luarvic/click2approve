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
  TENANT_USERS_GRID_COLUMN_SIZING,
} from "../../data/constants";
import { TenantUserRole } from "../../models/tenant";
import {
  ITenantUser,
  ITenantUserCreate,
  ITenantUserUpdate,
  TenantUserStatus,
} from "../../models/tenantUser";
import { stores } from "../../stores/stores";
import TenantUserDialog from "../dialogs/TenantUserDialog";
import TenantUserActionsMenu from "../menus/TenantUserActionsMenu";
import NoRowsOverlay from "../overlays/NoRowsOverlay";

const roleLabels = ["User", "Manager", "Admin"];
const statusLabels = ["Pending", "Active"];

const TenantUsersGrid = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [currentTenantUser, setCurrentTenantUser] =
    useState<ITenantUser | null>(null);
  const tenantId = stores.tenantStore.currentTenantId;
  const tenantUsersLoaderPrefix = tenantId
    ? `api/tenants/${tenantId}/users`
    : "";

  useEffect(() => {
    stores.tenantUserStore.clear();
    if (tenantId) {
      stores.tenantUserStore.load(tenantId);
    }
  }, [tenantId]);

  const openCreateDialog = () => {
    setCurrentTenantUser(null);
    setDialogIsOpen(true);
  };

  const openEditDialog = (tenantUser: ITenantUser) => {
    setCurrentTenantUser(tenantUser);
    setDialogIsOpen(true);
  };

  const handleDelete = async (tenantUser: ITenantUser) => {
    if (!tenantId || !window.confirm(`Delete ${tenantUser.email}?`)) {
      return;
    }

    await stores.tenantUserStore.delete(tenantId, tenantUser.id);
  };

  const handleSubmit = async (
    payload: ITenantUserCreate | ITenantUserUpdate,
    tenantUserId?: number
  ): Promise<boolean> => {
    if (!tenantId) {
      return false;
    }

    return tenantUserId
      ? await stores.tenantUserStore.update(
          tenantId,
          tenantUserId,
          payload as ITenantUserUpdate
        )
      : await stores.tenantUserStore.create(
          tenantId,
          payload as ITenantUserCreate
        );
  };

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={openCreateDialog}>
          New employee
        </Button>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "email",
      headerName: "Email",
      ...TENANT_USERS_GRID_COLUMN_SIZING.email,
    },
    {
      field: "firstName",
      headerName: "First name",
      ...TENANT_USERS_GRID_COLUMN_SIZING.firstName,
    },
    {
      field: "lastName",
      headerName: "Last name",
      ...TENANT_USERS_GRID_COLUMN_SIZING.lastName,
    },
    {
      field: "position",
      headerName: "Position",
      ...TENANT_USERS_GRID_COLUMN_SIZING.position,
    },
    {
      field: "role",
      headerName: "Role",
      ...TENANT_USERS_GRID_COLUMN_SIZING.role,
      valueFormatter: (value) => roleLabels[value as TenantUserRole],
    },
    {
      field: "status",
      headerName: "Status",
      ...TENANT_USERS_GRID_COLUMN_SIZING.status,
      renderCell: (params) => {
        const status = params.value as TenantUserStatus;
        return (
          <Chip
            label={statusLabels[status]}
            size="small"
            color={status === TenantUserStatus.Active ? "success" : "default"}
            variant={status === TenantUserStatus.Active ? "filled" : "outlined"}
          />
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      headerAlign: "right",
      align: "right",
      ...TENANT_USERS_GRID_COLUMN_SIZING.action,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <TenantUserActionsMenu
          tenantUser={params.row as ITenantUser}
          onEdit={openEditDialog}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  return (
    <Box sx={DATA_GRID_CONTAINER_SX}>
      <DataGrid
        rows={stores.tenantUserStore.tenantUsers}
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
          stores.commonStore.isLoading(`get_${tenantUsersLoaderPrefix}`) ||
          stores.commonStore.isLoading(`post_${tenantUsersLoaderPrefix}`) ||
          stores.commonStore.isLoadingByPrefix(
            `put_${tenantUsersLoaderPrefix}/`
          ) ||
          stores.commonStore.isLoadingByPrefix(
            `delete_${tenantUsersLoaderPrefix}/`
          )
        }
      />
      <TenantUserDialog
        open={dialogIsOpen}
        tenantUser={currentTenantUser}
        onClose={() => setDialogIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default observer(TenantUsersGrid);
