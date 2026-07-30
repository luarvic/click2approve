import { stores } from "@/app/rootStore";
import {
  ApprovalRequestTaskStatusLineLabel,
  getApprovalRequestTaskStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import ApprovalRequestNumberText, { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestRevisionChip from "@/features/approvalRequests/components/ApprovalRequestRevisionChip";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes, StackSpacing } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { getHumanReadableRelativeDate } from "@/shared/utils/helpers";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridSlots } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

interface InboxGridProps {
  currentTaskGlobalId?: string;
}

const InboxGrid: React.FC<InboxGridProps> = ({ currentTaskGlobalId }) => {
  const navigate = useNavigate();
  const tenantScopeIsReady =
    !stores.productStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded &&
      stores.tenantStore.currentTenantGlobalId !== null);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.approvalRequestTaskStore.tasks,
    currentTaskGlobalId,
  );

  useGridRefresh(() => {
    if (tenantScopeIsReady && tenantGlobalId) {
      return stores.approvalRequestTaskStore.loadIncoming(tenantGlobalId);
    }
  }, tenantScopeIsReady && tenantGlobalId !== null);

  const columns: GridColDef[] = [
    {
      field: "globalId",
      headerName: "Number",
      width: DataGrids.approvalNumberColumnWidth,
      renderCell: (params) => (
        <ApprovalRequestNumberText globalId={params.row.globalId} includeHash={false} />
      ),
      valueGetter: (_value, row) => getApprovalRequestNumber(row.globalId, false),
    },
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
        <ApprovalRequestTaskStatusLineLabel status={params.row.status} />
      ),
      valueGetter: (_value, row) => getApprovalRequestTaskStatusLabel(row.status),
    },
    {
      field: "requestedByDisplayName",
      headerName: "Requested by",
      flex: DataGrids.approvalColumnFlex.metadata,
      valueGetter: (_value, row) => row.requestedByDisplayName,
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
        getRowId={(row) => row.globalId}
        columns={columns}
        rowSelectionModel={currentTaskGlobalId === undefined ? [] : [currentTaskGlobalId]}
        hideFooterSelectedRowCount
        onRowClick={(params) => {
          const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
          const path = `/inbox/${(params.row as ApprovalRequestTaskListItem).globalId}`;
          navigate(tenantGlobalId ? Routes.tenantPath(tenantGlobalId, path) : "/");
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
          tenantGlobalId !== null &&
          (stores.commonStore.isLoading(
            `get_api/v1/tenants/${tenantGlobalId}/tasks`,
          ) ||
            stores.commonStore.isLoading(
              `post_api/v1/tenants/${tenantGlobalId}/tasks/complete`,
            ))
        }
      />
    </Box>
  );
};

export default observer(InboxGrid);
