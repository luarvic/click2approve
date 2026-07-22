import { stores } from "@/app/rootStore";
import {
  ApprovalRequestTaskStatusLineLabel,
  getApprovalRequestTaskStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { getHumanReadableRelativeDate } from "@/shared/utils/helpers";
import { Box, LinearProgress } from "@mui/material";
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
  const tenantId = stores.tenantStore.currentTenantId;
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.approvalRequestTaskStore.tasks,
    currentTaskId,
  );

  useGridRefresh(() => {
    if (tenantScopeIsReady && tenantId) {
      return stores.approvalRequestTaskStore.loadIncoming(tenantId);
    }
  }, tenantScopeIsReady && tenantId !== null);

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
        <ApprovalRequestTaskStatusLineLabel status={params.row.status} />
      ),
      valueGetter: (_value, row) => getApprovalRequestTaskStatusLabel(row.status),
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
          tenantId !== null &&
          (stores.commonStore.isLoading(
            `get_api/tenants/${tenantId}/tasks`,
          ) ||
            stores.commonStore.isLoading(
              `post_api/tenants/${tenantId}/tasks/complete`,
            ))
        }
      />
    </Box>
  );
};

export default observer(InboxGrid);
