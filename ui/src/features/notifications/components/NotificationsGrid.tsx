import { stores } from "@/app/rootStore";
import {
  deleteNotifications,
  listNotifications,
  markNotificationRead,
  markNotificationsRead,
} from "@/features/notifications/api/notificationsApi";
import NotificationsFilter from "@/features/notifications/components/NotificationsFilter";
import { getNotificationTypeLabel, type Notification } from "@/features/notifications/models/notification";
import {
  parseNotificationGridQuery,
  serializeNotificationGridQuery,
  type NotificationGridQuery,
} from "@/features/notifications/models/notificationGridQuery";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { DataGrids } from "@/shared/components/grids/dataGridSettings";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { NotificationType } from "@/shared/models/notifications";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getHumanReadableRelativeDate, parseUtcDateTime } from "@/shared/utils/dateTime";
import { Delete, Done, FilterList } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material";
import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import type { GridSortModel } from "@mui/x-data-grid";
import { DataGrid, GridColDef, GridRowSelectionModel, GridToolbarContainer } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const notificationColumnFlex = 15;
const notificationColumnMinWidth = 150;
const statusColumnFlex = 10;
const statusColumnMinWidth = 100;
const detailsColumnFlex = 55;
const receivedColumnFlex = 20;
const unreadNotificationRowClassName = "notification-grid-unread";
const filterContainerSx: SxProps<Theme> = { mb: 2 };
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
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const tenantId = stores.tenantStore.currentTenantGlobalId;
  const query = useMemo(() => parseNotificationGridQuery(searchParams), [searchParams]);
  const [items, setItems] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filtersAreVisible, setFiltersAreVisible] = useState(false);
  const [selectedNotificationGlobalIds, setSelectedNotificationGlobalIds] = useState<GridRowSelectionModel>([]);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const gridLoader = ActionLoaders.grids.notifications(tenantId);
  const deleteLoader = ActionLoaders.notifications.delete(tenantId);
  const markReadLoader = ActionLoaders.notifications.markRead(tenantId);
  const { isRunning: isDeleting, run: runDelete } = useAsyncAction(deleteLoader);
  const { isRunning: isMarkingRead, run: runMarkRead } = useAsyncAction(markReadLoader);

  const updateQuery = useCallback(
    (updates: Partial<NotificationGridQuery>) => {
      setSearchParams(serializeNotificationGridQuery({ ...query, ...updates }), { replace: true });
    },
    [query, setSearchParams],
  );

  const paginationModel = useMemo(() => ({ page: query.page, pageSize: query.pageSize }), [query.page, query.pageSize]);
  const sortModel = useMemo<GridSortModel>(
    () => [{ field: "occurredAt", sort: query.sortDirection }],
    [query.sortDirection],
  );
  const appliedFilterCount =
    query.type.length +
    query.status.length +
    Number(Boolean(query.details)) +
    Number(Boolean(query.receivedFrom)) +
    Number(Boolean(query.receivedTo));
  const receivedFromFilter = query.receivedFrom ? dayjs(query.receivedFrom) : null;
  const receivedToFilter = query.receivedTo ? dayjs(query.receivedTo) : null;

  const load = useCallback(async () => {
    if (tenantId) {
      const [page] = await Promise.all([
        listNotifications(tenantId, query),
        stores.notificationStore.loadUnreadCount(tenantId),
      ]);
      setItems(page.items);
      setTotalCount(page.totalCount);
    }
  }, [query, tenantId]);
  const gridIsLoading = useGridRefresh(
    load,
    tenantId !== null,
    `${gridLoader}:${serializeNotificationGridQuery(query)}`,
  );
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
      <Button
        aria-pressed={filtersAreVisible}
        disabled={isDeleting || isMarkingRead}
        startIcon={<FilterList />}
        onClick={() => setFiltersAreVisible((current) => !current)}
      >
        {filtersAreVisible ? "Hide filters" : `Show filters${appliedFilterCount > 0 ? ` (${appliedFilterCount})` : ""}`}
      </Button>
    </GridToolbarContainer>
  );
  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: "Notification",
      sortable: false,
      disableColumnMenu: true,
      flex: notificationColumnFlex,
      minWidth: notificationColumnMinWidth,
      valueGetter: (_value, row) => getNotificationTypeLabel(row.type),
    },
    {
      field: "readAt",
      headerName: "Status",
      sortable: false,
      disableColumnMenu: true,
      flex: statusColumnFlex,
      minWidth: statusColumnMinWidth,
      valueGetter: (_value, row) => (row.readAt ? "Read" : "Unread"),
    },
    {
      field: "summary",
      headerName: "Details",
      sortable: false,
      disableColumnMenu: true,
      flex: detailsColumnFlex,
    },
    {
      field: "occurredAt",
      headerName: "Received",
      sortable: true,
      flex: receivedColumnFlex,
      valueFormatter: (value) => getHumanReadableRelativeDate(parseUtcDateTime(value)),
    },
  ];

  return (
    <>
      {filtersAreVisible && (
        <Box sx={filterContainerSx}>
          <NotificationsFilter
            details={query.details}
            receivedFrom={receivedFromFilter}
            receivedTo={receivedToFilter}
            statuses={query.status}
            types={query.type}
            onDetailsChange={(details) => updateQuery({ details, page: 0 })}
            onReceivedFromChange={(value) =>
              updateQuery({ page: 0, receivedFrom: value?.format("YYYY-MM-DD") ?? null })
            }
            onReceivedToChange={(value) => updateQuery({ page: 0, receivedTo: value?.format("YYYY-MM-DD") ?? null })}
            onStatusesChange={(status) => updateQuery({ page: 0, status })}
            onTypesChange={(type) => updateQuery({ page: 0, type })}
          />
        </Box>
      )}
      <Box sx={DataGrids.containerSx}>
        <DataGrid
          autoHeight
          checkboxSelection
          columns={columns}
          columnVisibilityModel={{
            occurredAt: allColumnsAreVisible,
            summary: allColumnsAreVisible,
          }}
          disableColumnSelector
          disableColumnFilter
          disableRowSelectionOnClick
          getRowId={(row) => row.globalId}
          getRowClassName={(params) => (params.row.readAt ? "" : unreadNotificationRowClassName)}
          hideFooterSelectedRowCount
          loading={gridIsLoading || isDeleting || isMarkingRead}
          onRowClick={(params) => void open(params.row as Notification)}
          onRowSelectionModelChange={setSelectedNotificationGlobalIds}
          paginationMode="server"
          paginationModel={paginationModel}
          pageSizeOptions={DataGrids.pageSizeOptions}
          rowSelectionModel={selectedNotificationGlobalIds}
          rowCount={totalCount}
          rows={items}
          sortingMode="server"
          sortModel={sortModel}
          onPaginationModelChange={(model) => updateQuery({ page: model.page, pageSize: model.pageSize })}
          onSortModelChange={(model) => updateQuery({ page: 0, sortDirection: model[0]?.sort ?? "desc" })}
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
    </>
  );
};

export default NotificationsGrid;
