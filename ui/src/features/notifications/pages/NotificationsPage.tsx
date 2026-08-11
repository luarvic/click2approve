import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  Notification,
} from "@/features/notifications/api/notificationsApi";
import { stores } from "@/app/rootStore";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { DataGrids, Pages } from "@/shared/constants/constants";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getHumanReadableRelativeDate } from "@/shared/utils/dateTime";
import { Button, LinearProgress, Stack } from "@mui/material";
import { DataGrid, GridColDef, GridSlots } from "@mui/x-data-grid";
import { useState } from "react";

const notificationText = (type: number) =>
  [
    "A new approval task is ready.",
    "An approval request was cancelled.",
    "An approval request was reviewed.",
    "You have a new chat message.",
    "You have a new chat message.",
  ][type] ?? "Notification";

const NotificationsPage = () => {
  usePageTitle("Notifications");
  const tenantId = stores.tenantStore.currentTenantGlobalId;
  const [items, setItems] = useState<Notification[]>([]);
  const gridLoader = ActionLoaders.grids.notifications(tenantId);
  const gridIsLoading = useGridRefresh(
    async () => {
      if (tenantId) setItems(await listNotifications(tenantId, false));
    },
    tenantId !== null,
    gridLoader,
  );
  const load = async () => {
    if (tenantId) setItems(await listNotifications(tenantId, false));
  };
  const markAllRead = async () => {
    if (!tenantId) return;
    await markAllNotificationsRead(tenantId);
    await load();
  };
  const markRead = async (item: Notification) => {
    if (!tenantId || item.readAt) return;
    await markNotificationRead(tenantId, item.globalId);
    await load();
  };
  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: "Notification",
      flex: 1,
      valueGetter: (_value, row) => notificationText(row.type),
    },
    {
      field: "occurredAt",
      headerName: "Received",
      flex: 0.5,
      valueFormatter: (value) => getHumanReadableRelativeDate(value),
    },
    {
      field: "readAt",
      headerName: "Status",
      flex: 0.3,
      valueGetter: (_value, row) => (row.readAt ? "Read" : "Unread"),
    },
  ];
  return (
    <Stack sx={Pages.containerSx}>
      <PageBreadcrumbs items={[{ label: "Notifications" }]} />
      <Button
        disabled={gridIsLoading || items.every((item) => item.readAt)}
        onClick={() => void markAllRead()}
      >
        Mark all read
      </Button>
      <DataGrid
        autoHeight
        columns={columns}
        disableColumnFilter
        disableRowSelectionOnClick
        getRowId={(row) => row.globalId}
        hideFooterSelectedRowCount
        loading={gridIsLoading}
        onRowClick={(params) => void markRead(params.row as Notification)}
        pageSizeOptions={[DataGrids.defaultPageSize]}
        rows={items}
        slots={{
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
          noRowsOverlay: NoRowsOverlay,
        }}
        sx={DataGrids.sx}
      />
    </Stack>
  );
};

export default NotificationsPage;
