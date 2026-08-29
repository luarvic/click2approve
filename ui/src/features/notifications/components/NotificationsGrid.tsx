import { stores } from "@/app/rootStore";
import {
  deleteNotifications,
  listNotifications,
  markNotificationRead,
  markNotificationsRead,
} from "@/features/notifications/api/notificationsApi";
import type { Notification } from "@/features/notifications/models/notification";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { NotificationType } from "@/shared/models/notifications";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getHumanReadableRelativeDate, parseUtcDateTime } from "@/shared/utils/dateTime";
import { Delete, Done } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material";
import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel, GridToolbarContainer } from "@mui/x-data-grid";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

const notificationText = (type: number) =>
  ["New task", "Task completed", "Step completed", "Request completed", "New message"][type] ?? "Notification";

const notificationColumnFlex = 15;
const notificationColumnMinWidth = 150;
const statusColumnFlex = 10;
const statusColumnMinWidth = 100;
const detailsColumnFlex = 55;
const receivedColumnFlex = 20;
const unreadNotificationRowClassName = "notification-grid-unread";
const notificationGridSx: SxProps<Theme> = {
  ...DataGrids.sx,
  [`& .${unreadNotificationRowClassName} .MuiDataGrid-cell`]: {
    fontWeight: "bold",
  },
};

const getPath = (item: Notification) => {
  const isRequestNotification =
    item.type === NotificationType.ApprovalRequestStepCompleted ||
    item.type === NotificationType.ApprovalRequestCompleted ||
    item.type === NotificationType.DiscussionMessageCreated;
  const isDiscussionNotification = item.type === NotificationType.DiscussionMessageCreated;
  const resourcePath = isRequestNotification ? "requests" : "tasks";
  const chatPath = isDiscussionNotification ? "/chat" : "";
  return `/${resourcePath}/${item.entityGlobalId}${chatPath}`;
};

const NotificationsGrid = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const tenantId = stores.tenantStore.currentTenantGlobalId;
  const [items, setItems] = useState<Notification[]>([]);
  const [selectedNotificationGlobalIds, setSelectedNotificationGlobalIds] = useState<GridRowSelectionModel>([]);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const gridLoader = ActionLoaders.grids.notifications(tenantId);
  const deleteLoader = ActionLoaders.notifications.delete(tenantId);
  const markReadLoader = ActionLoaders.notifications.markRead(tenantId);
  const { isRunning: isDeleting, run: runDelete } = useAsyncAction(deleteLoader);
  const { isRunning: isMarkingRead, run: runMarkRead } = useAsyncAction(markReadLoader);
  const load = useCallback(async () => {
    if (tenantId) {
      const [notifications] = await Promise.all([
        listNotifications(tenantId, false),
        stores.notificationStore.loadUnreadCount(tenantId),
      ]);
      setItems(notifications);
    }
  }, [tenantId]);
  const gridIsLoading = useGridRefresh(load, tenantId !== null, gridLoader);
  const synchronize = useCallback(async () => {
    await load();
  }, [load]);
  const selectedUnreadNotificationGlobalIds = selectedNotificationGlobalIds
    .map(String)
    .filter((globalId) => items.some((item) => item.globalId === globalId && !item.readAt));
  const markSelectedRead = async () => {
    if (!tenantId || selectedUnreadNotificationGlobalIds.length === 0) return;
    const marked = await runMarkRead(async () => {
      await markNotificationsRead(tenantId, selectedUnreadNotificationGlobalIds);
      await synchronize();
      return true;
    });
    if (marked) {
      setSelectedNotificationGlobalIds([]);
    }
  };
  const deleteSelected = async () => {
    if (!tenantId || selectedNotificationGlobalIds.length === 0) return false;
    return (
      (await runDelete(async () => {
        await deleteNotifications(tenantId, selectedNotificationGlobalIds.map(String));
        await synchronize();
        setSelectedNotificationGlobalIds([]);
        return true;
      })) ?? false
    );
  };
  const open = async (item: Notification) => {
    if (!tenantId) return;
    if (!item.readAt) {
      const marked = await runMarkRead(async () => {
        await markNotificationRead(tenantId, item.globalId);
        await synchronize();
        return true;
      });
      if (!marked) return;
    }
    navigate(Routes.tenantPath(tenantId, getPath(item)));
  };
  const customToolbar = () => (
    <GridToolbarContainer>
      <Button
        disabled={gridIsLoading || isDeleting || isMarkingRead || selectedUnreadNotificationGlobalIds.length === 0}
        onClick={() => void markSelectedRead()}
        startIcon={<Done />}
      >
        Mark read
      </Button>
      <Button
        color="error"
        disabled={gridIsLoading || isDeleting || isMarkingRead || selectedNotificationGlobalIds.length === 0}
        onClick={() => setDeleteDialogIsOpen(true)}
        startIcon={<Delete />}
      >
        Delete
      </Button>
    </GridToolbarContainer>
  );
  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: "Notification",
      flex: notificationColumnFlex,
      minWidth: notificationColumnMinWidth,
      valueGetter: (_value, row) => notificationText(row.type),
    },
    {
      field: "readAt",
      headerName: "Status",
      flex: statusColumnFlex,
      minWidth: statusColumnMinWidth,
      valueGetter: (_value, row) => (row.readAt ? "Read" : "Unread"),
    },
    {
      field: "summary",
      headerName: "Details",
      flex: detailsColumnFlex,
    },
    {
      field: "occurredAt",
      headerName: "Received",
      flex: receivedColumnFlex,
      valueFormatter: (value) => getHumanReadableRelativeDate(parseUtcDateTime(value)),
    },
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        autoHeight
        checkboxSelection
        columns={columns}
        columnVisibilityModel={{
          occurredAt: allColumnsAreVisible,
          summary: allColumnsAreVisible,
        }}
        disableColumnFilter
        disableRowSelectionOnClick
        getRowId={(row) => row.globalId}
        getRowClassName={(params) => (params.row.readAt ? "" : unreadNotificationRowClassName)}
        hideFooterSelectedRowCount
        loading={gridIsLoading || isDeleting || isMarkingRead}
        onRowClick={(params) => void open(params.row as Notification)}
        onRowSelectionModelChange={setSelectedNotificationGlobalIds}
        pageSizeOptions={DataGrids.pageSizeOptions}
        rowSelectionModel={selectedNotificationGlobalIds}
        rows={items}
        slotProps={{
          baseCheckbox: { name: "notification-selection" },
        }}
        slots={{
          loadingOverlay: NoLoadingOverlay,
          noRowsOverlay: NoRowsOverlay,
          toolbar: customToolbar,
        }}
        sx={notificationGridSx}
      />
      <DeleteConfirmationDialog
        cancelLabel="Cancel"
        entityName={
          selectedNotificationGlobalIds.length === 1
            ? "this notification"
            : `${selectedNotificationGlobalIds.length} notifications`
        }
        open={deleteDialogIsOpen}
        title="Delete notifications"
        onClose={() => setDeleteDialogIsOpen(false)}
        onDelete={deleteSelected}
      />
    </Box>
  );
};

export default NotificationsGrid;
