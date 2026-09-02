import { stores } from "@/app/rootStore";
import ApprovalRequestNumberText, {
  getApprovalRequestNumber,
} from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestsFilter from "@/features/approvalRequests/components/ApprovalRequestsFilter";
import {
  ApprovalRequestStatusLineLabel,
  getApprovalRequestStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { listReceiptGrid } from "@/features/receipts/api/receiptsApi";
import type { ReceiptListItem } from "@/features/receipts/models/receipt";
import {
  type ReceiptGridQuery,
  parseReceiptGridQuery,
  serializeReceiptGridQuery,
} from "@/features/receipts/models/receiptGridQuery";
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
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ReceiptsGridProps {
  currentReceiptGlobalId?: string;
}

const filterContainerSx: SxProps<Theme> = { mb: 2 };

const ReceiptsGrid: React.FC<ReceiptsGridProps> = ({ currentReceiptGlobalId }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const tenantScopeIsReady =
    !stores.applicationConfigurationStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded && stores.tenantStore.currentTenantGlobalId !== null);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const gridLoader = ActionLoaders.grids.receipts(tenantGlobalId);
  const query = useMemo(() => parseReceiptGridQuery(searchParams), [searchParams]);
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);
  const [filtersAreVisible, setFiltersAreVisible] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const updateQuery = useCallback(
    (updates: Partial<ReceiptGridQuery>) => {
      setSearchParams(serializeReceiptGridQuery({ ...query, ...updates }), { replace: true });
    },
    [query, setSearchParams],
  );

  const paginationModel = useMemo(() => ({ page: query.page, pageSize: query.pageSize }), [query.page, query.pageSize]);
  const sortModel = useMemo<GridSortModel>(
    () => [{ field: "createdAt", sort: query.sortDirection }],
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
        return listReceiptGrid(tenantGlobalId, query).then((page) => {
          setReceipts(page.items);
          setTotalCount(page.totalCount);
        });
      }
    },
    tenantScopeIsReady && tenantGlobalId !== null,
    `${gridLoader}:${serializeReceiptGridQuery(query)}`,
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
      field: "approvalRequestTitle",
      headerName: "Title",
      sortable: false,
      disableColumnMenu: true,
      flex: DataGrids.approvalColumnFlex.content,
      renderCell: (params) => (
        <Stack sx={DataGrids.approvalTitleCellSx}>
          <Typography variant="body2">{params.row.approvalRequestTitle}</Typography>
        </Stack>
      ),
      valueGetter: (_value, row) => row.approvalRequestTitle,
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
      field: "approvalRequestStatus",
      headerName: "Status",
      sortable: false,
      disableColumnMenu: true,
      flex: DataGrids.approvalColumnFlex.metadata,
      renderCell: (params) => (
        <ApprovalRequestStatusLineLabel
          result={params.row.approvalRequestResult}
          status={params.row.approvalRequestStatus}
        />
      ),
      valueGetter: (_value, row) => getApprovalRequestStatusLabel(row.approvalRequestStatus, row.approvalRequestResult),
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
      field: "createdAt",
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
          rows={receipts}
          getRowId={(row) => row.globalId}
          columns={columns}
          rowSelectionModel={currentReceiptGlobalId === undefined ? [] : [currentReceiptGlobalId]}
          hideFooterSelectedRowCount
          onRowClick={(params) => {
            const currentTenantGlobalId = stores.tenantStore.currentTenantGlobalId;
            const path = `/receipts/${(params.row as ReceiptListItem).globalId}`;
            navigate(currentTenantGlobalId ? Routes.tenantPath(currentTenantGlobalId, path) : "/");
          }}
          paginationModel={paginationModel}
          paginationMode="server"
          rowCount={totalCount}
          onPaginationModelChange={(model) => updateQuery({ page: model.page, pageSize: model.pageSize })}
          columnVisibilityModel={{
            globalId: allColumnsAreVisible,
            createdByDisplayName: allColumnsAreVisible,
            createdAt: allColumnsAreVisible,
          }}
          pageSizeOptions={DataGrids.pageSizeOptions}
          disableColumnFilter
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(model) => updateQuery({ page: 0, sortDirection: model[0]?.sort ?? "desc" })}
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

export default ReceiptsGrid;
