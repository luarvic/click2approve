import { Check, Close, Loop, QuestionMark } from "@mui/icons-material";
import { Box, Link, Stack, Tooltip, Typography } from "@mui/material";
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
import { ApprovalStatus } from "../../models/ApprovalStatus";
import { IUserFile } from "../../models/UserFile";
import { approvalRequestStore } from "../../stores/ApprovalRequestStore";
import { DATA_GRID_DEFAULT_PAGE_SIZE } from "../../stores/Constants";
import { taskStore } from "../../stores/TaskStore";
import {
  getHumanReadableRelativeDate,
  getLocaleDateTimeString,
} from "../../utils/Converters";
import { downloadUserFile } from "../../utils/Downloaders";
import Tabs from "../Tabs";
import DialogTaskReview from "../dialogs/DialogTaskReview";
import { MenuTaskActions } from "../menus/MenuTaskActions";
import { IApprovalRequest } from "../../models/ApprovalRequest";

// Data grid with approval requests.
const GridTasks = () => {
  const { tasks } = taskStore;

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
      field: "approvalRequest",
      headerName: "Received",
      flex: 2,
      valueGetter: (params) => getHumanReadableRelativeDate(params.value.submittedDate),
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
      valueGetter: (params) => ApprovalStatus[params.row.status],
    },
    // {
    //   field: "approvalRequest",
    //   headerName: "Approve by",
    //   flex: 3,
    //   valueGetter: (params) =>
    //     params.value.approveByDate ? getLocaleDateTimeString(params.value.approveByDate as Date) : null,
    // },
    // {
    //   field: "approvalRequest.author",
    //   headerName: "Requester",
    //   flex: 5,
    //   valueGetter: (params) => (params.value as string).toLowerCase(),
    // },
    // {
    //   field: "approvalRequest.userFiles",
    //   headerName: "Files",
    //   flex: 5,
    //   valueGetter: (params) =>
    //     params.value.map((userFile: IUserFile) => userFile.name).join(", "),
    //   renderCell: (params) => {
    //     return (
    //       <Stack>
    //         {params.row.userFiles.map((userFile: IUserFile) => {
    //           return (
    //             <Link
    //               component="button"
    //               onClick={() => downloadUserFile(userFile)}
    //             >
    //               {userFile.name}
    //             </Link>
    //           );
    //         })}
    //       </Stack>
    //     );
    //   },
    // },
    // {
    //   field: "approvalRequest.comment",
    //   headerName: "Comment",
    //   flex: 10,
    //   renderCell: (params) => {
    //     return (
    //       <Stack>
    //         {(params.value.split(/\r?\n/) as string[]).map((line) => (
    //           <Box>{line}</Box>
    //         ))}
    //       </Stack>
    //     );
    //   },
    // },
    // {
    //   field: "action",
    //   headerName: "Action",
    //   flex: 1,
    //   renderCell: (params) => {
    //     return <MenuTaskActions task={params.row} />;
    //   },
    // },
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
            "&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell": { py: 0.5 },
            "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell": { py: 1 },
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

export default observer(GridTasks);
