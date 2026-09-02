import { stores } from "@/app/rootStore";
import ApprovalRequestNumberText, {
  getApprovalRequestNumber,
} from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import {
  ApprovalRequestStatusLineLabel,
  getApprovalRequestStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { listReceipts } from "@/features/receipts/api/receiptsApi";
import type { ReceiptListItem } from "@/features/receipts/models/receipt";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getHumanReadableRelativeDate } from "@/shared/utils/dateTime";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ReceiptsGridProps {
  currentReceiptGlobalId?: string;
}

const ReceiptsGrid: React.FC<ReceiptsGridProps> = ({ currentReceiptGlobalId }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const tenantScopeIsReady =
    !stores.applicationConfigurationStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded && stores.tenantStore.currentTenantGlobalId !== null);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const gridLoader = ActionLoaders.grids.receipts(tenantGlobalId);
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(receipts, currentReceiptGlobalId);

  const gridIsLoading = useGridRefresh(
    async () => {
      if (tenantScopeIsReady && tenantGlobalId) {
        setReceipts(await listReceipts(tenantGlobalId));
      }
    },
    tenantScopeIsReady && tenantGlobalId !== null,
    gridLoader,
  );

  const columns: GridColDef[] = [
    {
      field: "globalId",
      headerName: "Number",
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
      field: "createdAt",
      headerName: "Created",
      sortable: true,
      flex: DataGrids.approvalColumnFlex.metadata,
      valueFormatter: (value) => getHumanReadableRelativeDate(value),
    },
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={receipts}
        getRowId={(row) => row.globalId}
        columns={columns}
        rowSelectionModel={currentReceiptGlobalId === undefined ? [] : [currentReceiptGlobalId]}
        hideFooterSelectedRowCount
        onRowClick={(params) => {
          const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
          const path = `/receipts/${(params.row as ReceiptListItem).globalId}`;
          navigate(tenantGlobalId ? Routes.tenantPath(tenantGlobalId, path) : "/");
        }}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        columnVisibilityModel={{
          globalId: allColumnsAreVisible,
          createdAt: allColumnsAreVisible,
        }}
        pageSizeOptions={DataGrids.pageSizeOptions}
        disableColumnFilter
        disableColumnSelector
        disableRowSelectionOnClick
        slots={{
          loadingOverlay: NoLoadingOverlay,
          noRowsOverlay: NoRowsOverlay,
        }}
        sx={DataGrids.sx}
        autoHeight
        loading={gridIsLoading}
      />
    </Box>
  );
};

export default ReceiptsGrid;
