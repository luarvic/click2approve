import { stores } from "@/app/rootStore";
import ApprovalRequestNumberText, {
  getApprovalRequestNumber,
} from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestRevisionChip from "@/features/approvalRequests/components/ApprovalRequestRevisionChip";
import {
  ApprovalRequestStatusLineLabel,
  getApprovalRequestStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { listReceipts } from "@/features/receipts/api/receiptsApi";
import type { Receipt } from "@/features/receipts/models/receipt";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes, StackSpacing } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getHumanReadableRelativeDate } from "@/shared/utils/dateTime";
import { Box, LinearProgress, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridSlots } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ReceiptsGridProps {
  currentReceiptGlobalId?: string;
}

const ReceiptsGrid: React.FC<ReceiptsGridProps> = ({ currentReceiptGlobalId }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const createdColumnIsVisible = useMediaQuery(theme.breakpoints.up("md"));
  const numberColumnIsVisible = useMediaQuery(theme.breakpoints.up(DataGrids.approvalNumberColumnMinDisplayWidth));
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
      width: DataGrids.approvalNumberColumnWidth,
      renderCell: (params) => <ApprovalRequestNumberText globalId={params.row.globalId} includeHash={false} />,
      valueGetter: (_value, row) => getApprovalRequestNumber(row.globalId, false),
    },
    {
      field: "approvalRequestTitle",
      headerName: "Title",
      flex: DataGrids.approvalColumnFlex.content,
      renderCell: (params) => (
        <Stack sx={DataGrids.approvalTitleCellSx}>
          <Stack direction="row" spacing={StackSpacing.tight} alignItems="center">
            <Typography variant="body2">{params.row.approvalRequestTitle}</Typography>
            <ApprovalRequestRevisionChip revisionNumber={params.row.revisionNumber} />
          </Stack>
        </Stack>
      ),
      valueGetter: (_value, row) => row.approvalRequestTitle,
    },
    {
      field: "approvalRequestStatus",
      headerName: "Status",
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
          const path = `/receipts/${(params.row as Receipt).globalId}`;
          navigate(tenantGlobalId ? Routes.tenantPath(tenantGlobalId, path) : "/");
        }}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        columnVisibilityModel={{
          globalId: numberColumnIsVisible,
          createdAt: createdColumnIsVisible,
        }}
        pageSizeOptions={DataGrids.pageSizeOptions}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        }}
        sx={DataGrids.sx}
        autoHeight
        loading={gridIsLoading}
      />
    </Box>
  );
};

export default ReceiptsGrid;
