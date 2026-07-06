import {
  Box,
  Chip,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import {
  DATA_GRID_DEFAULT_PAGE_SIZE,
  MAX_SIZE_WHEN_DISPLAY,
} from "../../data/constants";
import { ApprovalStatus } from "../../models/approvalStatus";
import { IUserFile } from "../../models/userFile";
import { stores } from "../../stores/stores";
import {
  getHumanReadableRelativeDate,
  getLocaleDateTimeString,
} from "../../utils/helpers";
import CompletedTaskViewDialog from "../dialogs/CompletedTaskViewDialog";
import UncompletedTaskReviewDialog from "../dialogs/UncompletedTaskReviewDialog";
import UserFilesList from "../lists/UserFilesList";
import TaskActionsMenu from "../menus/TaskActionsMenu";
import NoRowsOverlay from "../overlays/NoRowsOverlay";

const InboxGrid = () => {
  const theme = useTheme();

  const getStatusChipColor = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.Approved:
        return "success" as const;
      case ApprovalStatus.Rejected:
        return "error" as const;
      default:
        return "default" as const;
    }
  };

  useEffect(() => {
    stores.approvalRequestTaskStore.clearTasks();
    stores.approvalRequestTaskStore.loadIncomingTasks();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "files",
      headerName: "Files to review",
      flex: 5,
      valueGetter: (_value, row) =>
        row.approvalRequest.userFiles
          .map((userFile: IUserFile) => userFile.name)
          .join(", "),
      renderCell: (params) => {
        return (
          <UserFilesList
            userFiles={params.row.approvalRequest.userFiles}
            direction="row"
          />
        );
      },
    },
    {
      field: "received",
      headerName: "Received",
      flex: 3,
      valueGetter: (_value, row) =>
        getHumanReadableRelativeDate(row.approvalRequest.submittedDate),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 3,
      renderCell: (params) => {
        const label =
          params.row.status === ApprovalStatus.Submitted
            ? "Pending"
            : ApprovalStatus[params.row.status];
        return (
          <Chip
            label={label}
            size="small"
            color={getStatusChipColor(params.row.status)}
          />
        );
      },
      valueGetter: (_value, row) =>
        row.status === ApprovalStatus.Submitted
          ? "Pending"
          : ApprovalStatus[row.status],
    },
    {
      field: "reviewBy",
      headerName: "Review by",
      flex: 3,
      valueGetter: (_value, row) =>
        row.approvalRequest.approveByDate
          ? getLocaleDateTimeString(row.approvalRequest.approveByDate as Date)
          : null,
    },
    {
      field: "requester",
      headerName: "Requester",
      flex: 5,
      valueGetter: (_value, row) =>
        (row.approvalRequest.author as string).toLowerCase(),
    },
    {
      field: "action",
      headerName: "Action",
      headerAlign: "right",
      align: "right",
      flex: 2,
      renderCell: (params) => {
        return <TaskActionsMenu task={params.row} />;
      },
    },
  ];

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <DataGrid
        rows={stores.approvalRequestTaskStore.tasks}
        columns={columns}
        columnVisibilityModel={{
          received: useMediaQuery(theme.breakpoints.up(MAX_SIZE_WHEN_DISPLAY)),
          status: useMediaQuery(theme.breakpoints.up(MAX_SIZE_WHEN_DISPLAY)),
          reviewBy: useMediaQuery(theme.breakpoints.up(MAX_SIZE_WHEN_DISPLAY)),
          requester: useMediaQuery(theme.breakpoints.up(MAX_SIZE_WHEN_DISPLAY)),
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: DATA_GRID_DEFAULT_PAGE_SIZE,
            },
          },
        }}
        pageSizeOptions={[DATA_GRID_DEFAULT_PAGE_SIZE]}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        }}
        sx={{
          border: "none",
          "--DataGrid-overlayHeight": "300px",
        }}
        autoHeight
        loading={
          stores.commonStore.isLoading("get_api/task/listUncompleted") ||
          stores.commonStore.isLoading("get_api/task/listCompleted") ||
          stores.commonStore.isLoading("post_api/task/complete")
        }
      />
      {stores.approvalRequestTaskStore.currentTask?.completed ? (
        <CompletedTaskViewDialog />
      ) : (
        <UncompletedTaskReviewDialog />
      )}
    </Box>
  );
};

export default observer(InboxGrid);
