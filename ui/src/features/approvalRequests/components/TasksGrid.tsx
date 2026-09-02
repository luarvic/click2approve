import { stores } from "@/app/rootStore";
import ApprovalRequestNumberText, {
  getApprovalRequestNumber,
} from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestTasksFilter from "@/features/approvalRequests/components/ApprovalRequestTasksFilter";
import {
  ApprovalRequestTaskStatusLineLabel,
  getApprovalRequestTaskStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { listApprovalRequestTaskGrid } from "@/features/approvalRequests/api/approvalRequestTasksApi";
import {
  ApprovalRequestTaskGridQuery,
  parseApprovalRequestTaskGridQuery,
  serializeApprovalRequestTaskGridQuery,
} from "@/features/approvalRequests/models/approvalRequestTaskGridQuery";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import { TenantType } from "@/features/tenants/models/tenant";
import OneLineDisplayName from "@/shared/components/identity/OneLineDisplayName";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getHumanReadableRelativeDate } from "@/shared/utils/dateTime";
import { FilterList } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material";
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import type { GridSortModel } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface TasksGridProps {
  currentTaskGlobalId?: string;
}

const filterContainerSx: SxProps<Theme> = { mb: 2 };

const TasksGrid: React.FC<TasksGridProps> = ({ currentTaskGlobalId }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const tenantScopeIsReady =
    !stores.applicationConfigurationStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded && stores.tenantStore.currentTenantGlobalId !== null);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const gridLoader = ActionLoaders.grids.tasks(tenantGlobalId);
  const organizationColumnIsVisible =
    allColumnsAreVisible && stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const query = useMemo(() => parseApprovalRequestTaskGridQuery(searchParams), [searchParams]);
  const [tasks, setTasks] = useState<ApprovalRequestTaskListItem[]>([]);
  const [filtersAreVisible, setFiltersAreVisible] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const updateQuery = useCallback(
    (updates: Partial<ApprovalRequestTaskGridQuery>) => {
      setSearchParams(serializeApprovalRequestTaskGridQuery({ ...query, ...updates }), { replace: true });
    },
    [query, setSearchParams],
  );

  const paginationModel = useMemo(() => ({ page: query.page, pageSize: query.pageSize }), [query.page, query.pageSize]);
  const sortModel = useMemo<GridSortModel>(
    () => [{ field: "createdAtDate", sort: query.sortDirection }],
    [query.sortDirection],
  );
  const appliedFilterCount =
    Number(Boolean(query.title)) +
    Number(Boolean(query.requestedBy)) +
    Number(Boolean(query.createdFrom)) +
    Number(Boolean(query.createdTo)) +
    query.status.length;
  const createdFromFilter = query.createdFrom ? dayjs(query.createdFrom) : null;
  const createdToFilter = query.createdTo ? dayjs(query.createdTo) : null;

  const gridIsLoading = useGridRefresh(
    () => {
      if (tenantScopeIsReady && tenantGlobalId) {
        return listApprovalRequestTaskGrid(tenantGlobalId, query).then((page) => {
          setTasks(page.items);
          setTotalCount(page.totalCount);
        });
      }
    },
    tenantScopeIsReady && tenantGlobalId !== null,
    `${gridLoader}:${serializeApprovalRequestTaskGridQuery(query)}`,
  );

  const customToolbar = () => (
    <GridToolbarContainer>
      <Button
        aria-pressed={filtersAreVisible}
        startIcon={<FilterList />}
        onClick={() => setFiltersAreVisible((current) => !current)}
      >
        {filtersAreVisible ? "Hide filters" : `Show filters${appliedFilterCount > 0 ? ` (${appliedFilterCount})` : ""}`}
      </Button>
    </GridToolbarContainer>
  );

  const columns: GridColDef[] = [
    {
      field: "globalId",
      headerName: "#",
      sortable: false,
      disableColumnMenu: true,
      width: DataGrids.approvalNumberColumnWidth,
      renderCell: (params) => (
        <ApprovalRequestNumberText color="text.primary" globalId={params.row.globalId} includeHash={false} />
      ),
      valueGetter: (_value, row) => getApprovalRequestNumber(row.globalId, false),
    },
    {
      field: "title",
      headerName: "Title",
      sortable: false,
      disableColumnMenu: true,
      flex: DataGrids.approvalColumnFlex.content,
      renderCell: (params) => (
        <Stack sx={DataGrids.approvalTitleCellSx}>
          <Typography variant="body2">{params.row.title}</Typography>
        </Stack>
      ),
      valueGetter: (_value, row) => row.title,
    },
    {
      field: "revisionNumber",
      headerName: "Revision",
      sortable: false,
      disableColumnMenu: true,
      align: "center",
      headerAlign: "center",
      width: DataGrids.approvalRevisionColumnWidth,
    },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      disableColumnMenu: true,
      ...DataGrids.tasksColumnSizing.status,
      renderCell: (params) => (
        <ApprovalRequestTaskStatusLineLabel
          action={params.row.action}
          result={params.row.result}
          status={params.row.status}
        />
      ),
      valueGetter: (_value, row) => getApprovalRequestTaskStatusLabel(row.status, row.action, row.result),
    },
    {
      field: "requestedByDisplayName",
      headerName: "Requested by",
      sortable: false,
      disableColumnMenu: true,
      ...DataGrids.tasksColumnSizing.requestedBy,
      renderCell: (params) => <OneLineDisplayName displayName={params.row.requestedByDisplayName} variant="body2" />,
      valueGetter: (_value, row) => row.requestedByDisplayName,
    },
    {
      field: "organizationDisplayName",
      headerName: "From organization",
      sortable: false,
      disableColumnMenu: true,
      flex: DataGrids.approvalColumnFlex.metadata,
      valueGetter: (_value, row) => row.organizationDisplayName,
    },
    {
      field: "createdAtDate",
      headerName: "Created",
      sortable: true,
      flex: DataGrids.approvalColumnFlex.metadata,
      valueFormatter: (value) => getHumanReadableRelativeDate(value),
    },
  ];

  return (
    <>
      {filtersAreVisible && (
        <Box sx={filterContainerSx}>
          <ApprovalRequestTasksFilter
            createdFrom={createdFromFilter}
            createdTo={createdToFilter}
            requestedBy={query.requestedBy}
            statuses={query.status}
            title={query.title}
            onCreatedFromChange={(value) => updateQuery({ createdFrom: value?.format("YYYY-MM-DD") ?? null, page: 0 })}
            onCreatedToChange={(value) => updateQuery({ createdTo: value?.format("YYYY-MM-DD") ?? null, page: 0 })}
            onRequestedByChange={(requestedBy) => updateQuery({ page: 0, requestedBy })}
            onStatusesChange={(status) => updateQuery({ page: 0, status })}
            onTitleChange={(title) => updateQuery({ page: 0, title })}
          />
        </Box>
      )}
      <Box sx={DataGrids.containerSx}>
        <DataGrid
          rows={tasks}
          getRowId={(row) => row.globalId}
          columns={columns}
          rowSelectionModel={currentTaskGlobalId === undefined ? [] : [currentTaskGlobalId]}
          hideFooterSelectedRowCount
          onRowClick={(params) => {
            const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
            const path = `/tasks/${(params.row as ApprovalRequestTaskListItem).globalId}`;
            navigate(tenantGlobalId ? Routes.tenantPath(tenantGlobalId, path) : "/");
          }}
          columnVisibilityModel={{
            globalId: allColumnsAreVisible,
            requestedByDisplayName: allColumnsAreVisible,
            organizationDisplayName: organizationColumnIsVisible,
            createdAtDate: allColumnsAreVisible,
          }}
          paginationModel={paginationModel}
          paginationMode="server"
          rowCount={totalCount}
          onPaginationModelChange={(model) => updateQuery({ page: model.page, pageSize: model.pageSize })}
          disableColumnFilter
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(model) => updateQuery({ page: 0, sortDirection: model[0]?.sort ?? "desc" })}
          pageSizeOptions={DataGrids.pageSizeOptions}
          disableColumnSelector
          disableRowSelectionOnClick
          slots={{ loadingOverlay: NoLoadingOverlay, toolbar: customToolbar, noRowsOverlay: NoRowsOverlay }}
          sx={DataGrids.sx}
          autoHeight
          loading={gridIsLoading}
        />
      </Box>
    </>
  );
};

export default observer(TasksGrid);
