import { Check, Close, Loop, QuestionMark } from "@mui/icons-material";
import { Box, Tooltip } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { ApprovalStatus } from "../../models/approvalStatus";
import { Tab } from "../../models/tab";
import { IUserFile } from "../../models/userFile";
import { stores } from "../../stores/Stores";
import { DATA_GRID_DEFAULT_PAGE_SIZE } from "../../stores/constantsStore";
import {
  getHumanReadableRelativeDate,
  getLocaleDateTimeString,
} from "../../utils/converters";
import TaskReviewDialog from "../dialogs/TaskReviewDialog";
import { CommentsList } from "../lists/CommentsList";
import { UserFilesList } from "../lists/UserFilesList";
import NoRowsOverlay from "../overlays/NoRowsOverlay";

const ArchiveGrid = () => {
  useEffect(() => {
    stores.commonStore.setCurrentTab(Tab.Archive);
    stores.taskStore.clearTasks();
    stores.taskStore.loadTasks(Tab.Archive);
  }, []);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  };

  const renderStatus = (status: ApprovalStatus) => {
    switch (status) {
      case 0:
        return <Loop />;
      case 1:
        return <Check />;
      case 2:
        return <Close />;
      default:
        return <QuestionMark />;
    }
  };

  const columns: GridColDef[] = [
    {
      field: "approvalRequest.submittedDate",
      headerName: "Received",
      flex: 2,
      valueGetter: (_value, row) =>
        getHumanReadableRelativeDate(row.approvalRequest.submittedDate),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        return (
          <Tooltip title={ApprovalStatus[params.row.status]}>
            {renderStatus(params.row.status)}
          </Tooltip>
        );
      },
      valueGetter: (_value, row) => ApprovalStatus[row.status],
    },
    {
      field: "approvalRequest.approveByDate",
      headerName: "Approve by",
      flex: 3,
      valueGetter: (_value, row) =>
        row.approvalRequest.approveByDate
          ? getLocaleDateTimeString(row.approvalRequest.approveByDate as Date)
          : null,
    },
    {
      field: "completedDate",
      headerName: "Completed",
      flex: 3,
      valueFormatter: (value) =>
        value ? getLocaleDateTimeString(value as Date) : null,
    },
    {
      field: "approvalRequest.author",
      headerName: "Requester",
      flex: 5,
      valueGetter: (_value, row) =>
        (row.approvalRequest.author as string).toLowerCase(),
    },
    {
      field: "approvalRequest.userFiles",
      headerName: "Files",
      flex: 5,
      valueGetter: (_value, row) =>
        row.approvalRequest.userFiles
          .map((userFile: IUserFile) => userFile.name)
          .join(", "),
      renderCell: (params) => {
        return (
          <UserFilesList userFiles={params.row.approvalRequest.userFiles} />
        );
      },
    },
    {
      field: "approvalRequest.comment",
      headerName: "Comment",
      flex: 10,
      valueGetter: (_value, row) =>
        [row.approvalRequest.comment, row.comment].join(" "),
      renderCell: (params) => {
        return (
          <CommentsList
            approvalRequestComment={params.row.approvalRequest.comment}
            approverComment={params.row.comment}
          />
        );
      },
    },
  ];

  return (
    <Box sx={{ width: "100%", overflow: "hidden", pr: 2 }}>
      <DataGrid
        rows={stores.taskStore.tasks}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: DATA_GRID_DEFAULT_PAGE_SIZE,
            },
          },
        }}
        pageSizeOptions={[DATA_GRID_DEFAULT_PAGE_SIZE]}
        disableRowSelectionOnClick
        slots={{
          toolbar: customToolbar,
          noRowsOverlay: NoRowsOverlay,
        }}
        getRowHeight={() => "auto"}
        sx={{
          "&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell": {
            py: 0.5,
          },
          "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell": {
            py: 1,
          },
          "&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell": {
            py: 1.5,
          },
          "--DataGrid-overlayHeight": "300px",
        }}
        autoHeight
      />
      <TaskReviewDialog />
    </Box>
  );
};

export default observer(ArchiveGrid);
