import { Box, Stack } from "@mui/material";
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
import { Tab } from "../../models/tab";
import { IUserFile } from "../../models/userFile";
import { stores } from "../../stores/Stores";
import { DATA_GRID_DEFAULT_PAGE_SIZE } from "../../stores/constantsStore";
import {
  getHumanReadableRelativeDate,
  getLocaleDateTimeString,
} from "../../utils/converters";
import TaskReviewDialog from "../dialogs/TaskReviewDialog";
import { UserFilesList } from "../lists/UserFilesList";
import { TaskActionsMenu } from "../menus/TaskActionsMenu";
import NoRowsOverlay from "../overlays/NoRowsOverlay";

const InboxGrid = () => {
  useEffect(() => {
    stores.commonStore.setCurrentTab(Tab.Inbox);
    stores.taskStore.clearTasks();
    stores.taskStore.loadTasks(Tab.Inbox);
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

  const columns: GridColDef[] = [
    {
      field: "approvalRequest.submittedDate",
      headerName: "Received",
      flex: 2,
      valueGetter: (params) =>
        getHumanReadableRelativeDate(params.row.approvalRequest.submittedDate),
    },
    {
      field: "approvalRequest.approveByDate",
      headerName: "Approve by",
      flex: 3,
      valueGetter: (params) =>
        params.row.approvalRequest.approveByDate
          ? getLocaleDateTimeString(
              params.row.approvalRequest.approveByDate as Date
            )
          : null,
    },
    {
      field: "approvalRequest.author",
      headerName: "Requester",
      flex: 5,
      valueGetter: (params) =>
        (params.row.approvalRequest.author as string).toLowerCase(),
    },
    {
      field: "approvalRequest.userFiles",
      headerName: "Files",
      flex: 5,
      valueGetter: (params) =>
        params.row.approvalRequest.userFiles
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
      renderCell: (params) => {
        return (
          <Stack>
            {params.row.approvalRequest.comment &&
              (
                params.row.approvalRequest.comment.split(/\r?\n/) as string[]
              ).map((line) => <Box>{line}</Box>)}
          </Stack>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => {
        return <TaskActionsMenu task={params.row} />;
      },
    },
  ];

  return (
    <Box sx={{ width: "100%", overflow: "hidden", pr: 2 }}>
      <DataGrid
        className="DataGridDefault"
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
        slotProps={{
          columnsPanel: {
            disableHideAllButton: true,
            disableShowAllButton: true,
          },
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

export default observer(InboxGrid);
