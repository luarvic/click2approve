import { stores } from "@/app/rootStore";
import ApprovalRequestNumberText, {
  getApprovalRequestNumber,
} from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestsFilter from "@/features/approvalRequests/components/ApprovalRequestsFilter";
import {
  ApprovalRequestStatusLineLabel,
  getApprovalRequestStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { listApprovalRequestGrid } from "@/features/approvalRequests/api/approvalRequestsApi";
import {
  ApprovalRequestGridQuery,
  parseApprovalRequestGridQuery,
  serializeApprovalRequestGridQuery,
} from "@/features/approvalRequests/models/approvalRequestGridQuery";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import OneLineDisplayName from "@/shared/components/identity/OneLineDisplayName";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getHumanReadableRelativeDate } from "@/shared/utils/dateTime";
import { Add, FilterList } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material";
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import type { GridSortModel } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface RequestsGridProps {
  currentApprovalRequestGlobalId?: string;
}

const filterContainerSx: SxProps<Theme> = { mb: 2 };

const RequestsGrid: React.FC<RequestsGridProps> = ({ currentApprovalRequestGlobalId }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const tenantScopeIsReady =
    !stores.applicationConfigurationStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded && stores.tenantStore.currentTenantGlobalId !== null);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const gridLoader = ActionLoaders.grids.requests(tenantGlobalId);
  const query = useMemo(() => parseApprovalRequestGridQuery(searchParams), [searchParams]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequestListItem[]>([]);
  const [filtersAreVisible, setFiltersAreVisible] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const updateQuery = useCallback(
    (updates: Partial<ApprovalRequestGridQuery>) => {
      setSearchParams(serializeApprovalRequestGridQuery({ ...query, ...updates }), { replace: true });
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
        return listApprovalRequestGrid(tenantGlobalId, query).then((page) => {
          setApprovalRequests(page.items);
          setTotalCount(page.totalCount);
        });
      }
    },
    tenantScopeIsReady && tenantGlobalId !== null,
    `${gridLoader}:${serializeApprovalRequestGridQuery(query)}`,
  );

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={() => {
            const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
            navigate(tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/requests/new") : "/");
          }}
        >
          New request
        </Button>
        <Button
          aria-pressed={filtersAreVisible}
          startIcon={<FilterList />}
          onClick={() => setFiltersAreVisible((current) => !current)}
        >
          {filtersAreVisible
            ? "Hide filters"
            : `Show filters${appliedFilterCount > 0 ? ` (${appliedFilterCount})` : ""}`}
        </Button>
      </GridToolbarContainer>
    );
  };

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
      flex: DataGrids.approvalColumnFlex.metadata,
      renderCell: (params) => <ApprovalRequestStatusLineLabel result={params.row.result} status={params.row.status} />,
      valueGetter: (_value, row) => getApprovalRequestStatusLabel(row.status, row.result),
    },
    {
      field: "createdByDisplayName",
      headerName: "Requested by",
      sortable: false,
      disableColumnMenu: true,
      flex: DataGrids.approvalColumnFlex.metadata,
      renderCell: (params) => <OneLineDisplayName displayName={params.row.createdByDisplayName} variant="body2" />,
      valueGetter: (_value, row) => row.createdByDisplayName,
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
          <ApprovalRequestsFilter
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
          rows={approvalRequests}
          getRowId={(row) => row.globalId}
          columns={columns}
          rowSelectionModel={
            currentApprovalRequestGlobalId === undefined
              ? stores.approvalRequestStore.currentApprovalRequest
                ? [stores.approvalRequestStore.currentApprovalRequest.globalId]
                : []
              : [currentApprovalRequestGlobalId]
          }
          hideFooterSelectedRowCount
          onRowClick={(params) => {
            const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
            const path = `/requests/${(params.row as ApprovalRequestListItem).globalId}`;
            navigate(tenantGlobalId ? Routes.tenantPath(tenantGlobalId, path) : "/");
          }}
          columnVisibilityModel={{
            globalId: allColumnsAreVisible,
            createdByDisplayName: allColumnsAreVisible,
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
    </>
  );
};

export default observer(RequestsGrid);
