import { stores } from "@/app/rootStore";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { getHumanReadableRelativeDate } from "@/shared/utils/helpers";
import { Box, Chip, LinearProgress } from "@mui/material";
import { DataGrid, GridColDef, GridSlots } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

interface InboxGridProps {
  currentTaskId?: number;
}

const InboxGrid: React.FC<InboxGridProps> = ({ currentTaskId }) => {
  const navigate = useNavigate();
  const tenantScopeIsReady =
    !stores.productStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded &&
      stores.tenantStore.currentTenantId !== null);
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.approvalRequestTaskStore.tasks,
    currentTaskId,
  );

  const getStatusChipColor = (status: ApprovalRequestTaskStatus) => {
    switch (status) {
      case ApprovalRequestTaskStatus.Approved:
        return "success" as const;
      case ApprovalRequestTaskStatus.Rejected:
        return "error" as const;
      case ApprovalRequestTaskStatus.Skipped:
        return "default" as const;
      default:
        return "warning" as const;
    }
  };

  useGridRefresh(() => {
    if (tenantScopeIsReady) {
      return stores.approvalRequestTaskStore.loadIncoming();
    }
  }, tenantScopeIsReady);

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
        const label = ApprovalRequestTaskStatus[params.row.status];
        return (
          <Chip
            label={label}
            size="small"
            color={getStatusChipColor(params.row.status)}
          />
        );
      },
      valueGetter: (_value, row) => ApprovalRequestTaskStatus[row.status],
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
        rows={stores.approvalRequestTaskStore.tasks}
        columns={columns}
        rowSelectionModel={currentTaskId === undefined ? [] : [currentTaskId]}
        hideFooterSelectedRowCount
        onRowClick={(params) => {
          const tenantId = stores.tenantStore.currentTenantId;
          const path = `/inbox/${(params.row as ApprovalRequestTaskListItem).id}`;
          navigate(tenantId ? Routes.tenantPath(tenantId, path) : "/");
        }}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[DataGrids.defaultPageSize]}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        }}
        sx={DataGrids.sx}
        autoHeight
        loading={
          stores.commonStore.isLoading("get_api/task/list") ||
          stores.commonStore.isLoading("post_api/task/complete")
        }
      />
    </Box>
  );
};

export default observer(InboxGrid);
