import { Check, Close, Loop, QuestionMark } from "@mui/icons-material";
import { Box, Link, Stack, Tooltip } from "@mui/material";
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
import { DATA_GRID_DEFAULT_PAGE_SIZE } from "../../stores/Constants";
import { taskStore } from "../../stores/TaskStore";
import {
  getHumanReadableRelativeDate,
  getLocaleDateTimeString,
} from "../../utils/Converters";
import { downloadUserFile } from "../../utils/Downloaders";
import Tabs from "../Tabs";
import DialogTaskReview from "../dialogs/DialogTaskReview";

const GridArchive = () => {
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
      field: "approvalRequest.submittedDate",
      headerName: "Received",
      flex: 2,
      valueGetter: (params) =>
        getHumanReadableRelativeDate(params.row.approvalRequest.submittedDate),
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
      field: "completedDate",
      headerName: "Completed",
      flex: 3,
      valueFormatter: (params) =>
        params.value ? getLocaleDateTimeString(params.value as Date) : null,
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
          <Stack>
            {params.row.approvalRequest.userFiles.map((userFile: IUserFile) => {
              return (
                <Link
                  component="button"
                  onClick={() => downloadUserFile(userFile)}
                >
                  {userFile.name}
                </Link>
              );
            })}
          </Stack>
        );
      },
    },
    {
      field: "approvalRequest.comment",
      headerName: "Comment",
      flex: 10,
      valueGetter: (params) =>
        [params.row.approvalRequest.comment, params.row.comment].join(" "),
      renderCell: (params) => {
        return (
          <Stack>
            {params.row.approvalRequest.comment &&
              (
                params.row.approvalRequest.comment.split(/\r?\n/) as string[]
              ).map((line) => <Box>{line}</Box>)}
            {params.row.comment && (
              <>
                <Box>{">>>"}</Box>
                {(params.row.comment.split(/\r?\n/) as string[]).map((line) => (
                  <Box>{line}</Box>
                ))}
              </>
            )}
          </Stack>
        );
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

export default observer(GridArchive);
