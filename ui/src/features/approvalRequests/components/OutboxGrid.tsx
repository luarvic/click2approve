import { stores } from "@/app/rootStore";
import {
  ApprovalRequestStatusLineLabel,
  getApprovalRequestStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { getHumanReadableRelativeDate } from "@/shared/utils/helpers";
import { Add } from "@mui/icons-material";
import { Box, Button, LinearProgress } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

interface OutboxGridProps {
  currentApprovalRequestId?: number;
}

const OutboxGrid: React.FC<OutboxGridProps> = ({ currentApprovalRequestId }) => {
  const navigate = useNavigate();
  const tenantScopeIsReady =
    !stores.productStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded &&
      stores.tenantStore.currentTenantId !== null);
  const tenantId = stores.tenantStore.currentTenantId;
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.approvalRequestStore.approvalRequests,
    currentApprovalRequestId,
  );

  useGridRefresh(() => {
    if (tenantScopeIsReady && tenantId) {
      return stores.approvalRequestStore.load(tenantId);
    }
  }, tenantScopeIsReady && tenantId !== null);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={() => {
            const tenantId = stores.tenantStore.currentTenantId;
            navigate(
              tenantId
                ? Routes.tenantPath(tenantId, "/outbox/new")
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
        columns={columns}
        rowSelectionModel={
          currentApprovalRequestId === undefined
            ? stores.approvalRequestStore.currentApprovalRequest
              ? [stores.approvalRequestStore.currentApprovalRequest.id]
              : []
            : [currentApprovalRequestId]
        }
        hideFooterSelectedRowCount
        onRowClick={(params) => {
          const tenantId = stores.tenantStore.currentTenantId;
          const path = `/outbox/${(params.row as ApprovalRequestListItem).id}`;
          navigate(tenantId ? Routes.tenantPath(tenantId, path) : "/");
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
          tenantId !== null &&
          (stores.commonStore.isLoading(
            `get_api/tenants/${tenantId}/requests`,
          ) ||
            stores.commonStore.isLoading(
              `post_api/tenants/${tenantId}/requests`,
            ) ||
            stores.commonStore.isLoadingByPrefix(
              `post_api/tenants/${tenantId}/requests/`,
            ))
        }
      />
    </Box>
  );
};

export default observer(OutboxGrid);
