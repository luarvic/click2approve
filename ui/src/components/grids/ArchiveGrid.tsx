import { Box, LinearProgress } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
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
import CompletedTaskViewDialog from "../dialogs/CompletedTaskViewDialog";
import UserFilesList from "../lists/UserFilesList";
import TaskActionsMenu from "../menus/TaskActionsMenu";
import NoRowsOverlay from "../overlays/NoRowsOverlay";
import StatusButton from "../buttons/StatusButton";

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
        return <StatusButton status={params.row.status} />;
      },
      valueGetter: (_value, row) => ApprovalStatus[row.status],
    },
    {
      field: "approvalRequest.approveByDate",
      headerName: "Review by",
      flex: 3,
      valueGetter: (_value, row) =>
        row.approvalRequest.approveByDate
          ? getLocaleDateTimeString(row.approvalRequest.approveByDate as Date)
          : null,
    },
    {
      field: "completedDate",
      headerName: "Reviewed",
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
          <UserFilesList
            userFiles={params.row.approvalRequest.userFiles}
            direction="row"
          />
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      headerAlign: "right",
      align: "right",
      flex: 1,
      renderCell: (params) => {
        return <TaskActionsMenu task={params.row} />;
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
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        }}
        sx={{
          "--DataGrid-overlayHeight": "300px",
        }}
        autoHeight
        loading={stores.commonStore.isLoading("get_api/task/listCompleted")}
      />
      <CompletedTaskViewDialog />
    </Box>
  );
};

export default observer(ArchiveGrid);
