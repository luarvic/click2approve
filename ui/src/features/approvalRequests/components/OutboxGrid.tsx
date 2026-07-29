import { stores } from "@/app/rootStore";
import {
  ApprovalRequestStatusLineLabel,
  getApprovalRequestStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import ApprovalRequestRevisionChip from "@/features/approvalRequests/components/ApprovalRequestRevisionChip";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes, StackSpacing } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { getHumanReadableRelativeDate } from "@/shared/utils/helpers";
import { Add } from "@mui/icons-material";
import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

interface OutboxGridProps {
  currentApprovalRequestGlobalId?: string;
}

const OutboxGrid: React.FC<OutboxGridProps> = ({ currentApprovalRequestGlobalId }) => {
  const navigate = useNavigate();
  const tenantScopeIsReady =
    !stores.productStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded &&
      stores.tenantStore.currentTenantGlobalId !== null);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.approvalRequestStore.approvalRequests,
    currentApprovalRequestGlobalId,
  );

  useGridRefresh(() => {
    if (tenantScopeIsReady && tenantGlobalId) {
      return stores.approvalRequestStore.load(tenantGlobalId);
    }
  }, tenantScopeIsReady && tenantGlobalId !== null);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={() => {
            const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
            navigate(
              tenantGlobalId
                ? Routes.tenantPath(tenantGlobalId, "/outbox/new")
                : "/",
            );
          }}
        >
          New request
        </Button>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: DataGrids.approvalColumnFlex.content,
      renderCell: (params) => (
        <Stack sx={DataGrids.approvalTitleCellSx}>
          <Stack
            direction="row"
            spacing={StackSpacing.tight}
            alignItems="center"
          >
            <Typography variant="body2">{params.row.title}</Typography>
            <ApprovalRequestRevisionChip revisionNumber={params.row.revisionNumber} />
          </Stack>
        </Stack>
      ),
      valueGetter: (_value, row) => row.title,
    },
    {
      field: "status",
      headerName: "Status",
      flex: DataGrids.approvalColumnFlex.metadata,
      renderCell: (params) => (
        <ApprovalRequestStatusLineLabel status={params.row.status} />
      ),
      valueGetter: (_value, row) => getApprovalRequestStatusLabel(row.status),
    },
    {
      field: "createdByDisplayName",
      headerName: "Created by",
      flex: DataGrids.approvalColumnFlex.metadata,
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
          const path = `/outbox/${(params.row as ApprovalRequestListItem).globalId}`;
          navigate(tenantGlobalId ? Routes.tenantPath(tenantGlobalId, path) : "/");
        }}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[DataGrids.defaultPageSize]}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          toolbar: customToolbar,
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        }}
        sx={DataGrids.sx}
        autoHeight
        loading={
          tenantGlobalId !== null &&
          (stores.commonStore.isLoading(
            `get_api/v1/tenants/${tenantGlobalId}/requests`,
          ) ||
            stores.commonStore.isLoading(
              `post_api/v1/tenants/${tenantGlobalId}/requests`,
            ) ||
            stores.commonStore.isLoadingByPrefix(
              `post_api/v1/tenants/${tenantGlobalId}/requests/`,
            ))
        }
      />
    </Box>
  );
};

export default observer(OutboxGrid);
