import { stores } from "@/app/rootStore";
import TaskActionsMenu from "@/features/approvalRequests/components/TaskActionsMenu";
import UncompletedTaskReviewDialog from "@/features/approvalRequests/components/UncompletedTaskReviewDialog";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids } from "@/shared/constants/constants";
import { getHumanReadableRelativeDate } from "@/shared/utils/helpers";
import { Box, Chip, LinearProgress } from "@mui/material";
import { DataGrid, GridColDef, GridSlots } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

const InboxGrid = () => {
  const tenantScopeIsReady =
    !stores.productStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded &&
      stores.tenantStore.currentTenantId !== null);

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

  useEffect(() => {
    if (!tenantScopeIsReady) {
      return;
    }

    stores.approvalRequestTaskStore.clear();
    stores.approvalRequestTaskStore.loadIncoming();
  }, [tenantScopeIsReady]);

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
    {
      field: "actions",
      headerName: "Actions",
      headerAlign: "right",
      align: "right",
      flex: DataGrids.approvalColumnFlex.action,
      renderCell: (params) => {
        return <TaskActionsMenu task={params.row} />;
      },
    },
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={stores.approvalRequestTaskStore.tasks}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: DataGrids.defaultPageSize,
            },
          },
        }}
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
          stores.commonStore.isLoading("get_api/task/listUncompleted") ||
          stores.commonStore.isLoading("post_api/task/complete")
        }
      />
      <UncompletedTaskReviewDialog />
    </Box>
  );
};

export default observer(InboxGrid);
