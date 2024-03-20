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
import { Tab } from "../../models/Tab";
import { IUserFile } from "../../models/UserFile";
import { commonStore } from "../../stores/CommonStore";
import { DATA_GRID_DEFAULT_PAGE_SIZE } from "../../stores/Constants";
import { taskStore } from "../../stores/TaskStore";
import {
  getHumanReadableRelativeDate,
  getLocaleDateTimeString,
} from "../../utils/Converters";
import Tabs from "../Tabs";
import DialogTaskReview from "../dialogs/DialogTaskReview";
import { ListUserFiles } from "../lists/ListUserFiles";
import { MenuTaskActions } from "../menus/MenuTaskActions";

const GridInbox = () => {
  const { setCurrentTab } = commonStore;
  const { tasks, clearTasks, loadTasks } = taskStore;

  useEffect(() => {
    setCurrentTab(Tab.Inbox);
    clearTasks();
    loadTasks(Tab.Inbox);
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
          <ListUserFiles userFiles={params.row.approvalRequest.userFiles} />
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
        return <MenuTaskActions task={params.row} />;
      },
    },
  ];

  return (
    <Box sx={{ display: "flex", pt: 2 }}>
      <Tabs />
      <Box sx={{ width: "100%", overflow: "hidden", pr: 2 }}>
        <DataGrid
          className="DataGridDefault"
          rows={tasks}
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
          }}
          autoHeight
        />
      </Box>
      <DialogTaskReview />
    </Box>
  );
};

export default observer(GridInbox);
