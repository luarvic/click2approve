import { stores } from "@/app/rootStore";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { getHumanReadableRelativeDate } from "@/shared/utils/helpers";
import { Add } from "@mui/icons-material";
import { Box, Button, Chip, LinearProgress } from "@mui/material";
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
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.approvalRequestStore.approvalRequests,
    currentApprovalRequestId,
  );

  const getStatusChipColor = (status: ApprovalRequestStatus) => {
    switch (status) {
      case ApprovalRequestStatus.Approved:
        return "success" as const;
      case ApprovalRequestStatus.Rejected:
        return "error" as const;
      default:
        return "default" as const;
    }
  };

  useGridRefresh(() => {
    if (tenantScopeIsReady) {
      return stores.approvalRequestStore.load();
    }
  }, tenantScopeIsReady);

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
      renderCell: (params) => {
        const label = ApprovalRequestStatus[params.row.status];
        return (
          <Chip
            label={label}
            size="small"
            color={getStatusChipColor(params.row.status)}
          />
        );
      },
      valueGetter: (_value, row) => ApprovalRequestStatus[row.status],
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
          stores.commonStore.isLoading("get_api/request/list") ||
          stores.commonStore.isLoading("delete_api/request")
        }
      />
    </Box>
  );
};

export default observer(OutboxGrid);
