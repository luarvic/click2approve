import { stores } from "@/app/rootStore";
import ApprovalRequestNumberText, {
  getApprovalRequestNumber,
} from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import {
  ApprovalRequestStatusLineLabel,
  getApprovalRequestStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import OneLineDisplayName from "@/shared/components/identity/OneLineDisplayName";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getHumanReadableRelativeDate } from "@/shared/utils/dateTime";
import { Add } from "@mui/icons-material";
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

interface RequestsGridProps {
  currentApprovalRequestGlobalId?: string;
}

const RequestsGrid: React.FC<RequestsGridProps> = ({ currentApprovalRequestGlobalId }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const tenantScopeIsReady =
    !stores.applicationConfigurationStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded && stores.tenantStore.currentTenantGlobalId !== null);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const gridLoader = ActionLoaders.grids.requests(tenantGlobalId);
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.approvalRequestStore.approvalRequests,
    currentApprovalRequestGlobalId,
  );

  const gridIsLoading = useGridRefresh(
    () => {
      if (tenantScopeIsReady && tenantGlobalId) {
        return stores.approvalRequestStore.load(tenantGlobalId);
      }
    },
    tenantScopeIsReady && tenantGlobalId !== null,
    gridLoader,
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
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "globalId",
      headerName: "Number",
      width: DataGrids.approvalNumberColumnWidth,
      renderCell: (params) => (
        <ApprovalRequestNumberText color="text.primary" globalId={params.row.globalId} includeHash={false} />
      ),
      valueGetter: (_value, row) => getApprovalRequestNumber(row.globalId, false),
    },
    {
      field: "title",
      headerName: "Title",
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
      align: "center",
      headerAlign: "center",
      width: DataGrids.approvalRevisionColumnWidth,
    },
    {
      field: "status",
      headerName: "Status",
      flex: DataGrids.approvalColumnFlex.metadata,
      renderCell: (params) => <ApprovalRequestStatusLineLabel result={params.row.result} status={params.row.status} />,
      valueGetter: (_value, row) => getApprovalRequestStatusLabel(row.status, row.result),
    },
    {
      field: "createdByDisplayName",
      headerName: "Requested by",
      flex: DataGrids.approvalColumnFlex.metadata,
      renderCell: (params) => <OneLineDisplayName displayName={params.row.createdByDisplayName} variant="body2" />,
      valueGetter: (_value, row) => row.createdByDisplayName,
    },
    {
      field: "createdAtDate",
      headerName: "Created",
      flex: DataGrids.approvalColumnFlex.metadata,
      valueFormatter: (value) => getHumanReadableRelativeDate(value),
    },
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={stores.approvalRequestStore.approvalRequests}
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
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={DataGrids.pageSizeOptions}
        disableColumnFilter
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
  );
};

export default observer(RequestsGrid);
