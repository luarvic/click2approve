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
import {
  getHumanReadableRelativeDate,
  getLocaleDateTimeString,
} from "../../utils/Converters";
import { downloadUserFile } from "../../utils/Downloaders";
import Tabs from "../Tabs";
import DialogApprovalRequestView from "../dialogs/DialogApprovalRequestView";
import { MenuApprovalRequestActions } from "../menus/MenuApprovalRequestActions";

// Data grid with approval requests.
const GridApprovalRequests = () => {
  const { approvalRequests } = approvalRequestStore;

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
      field: "submittedDate",
      headerName: "Submitted",
      flex: 2,
      valueFormatter: (params) => getHumanReadableRelativeDate(params.value),
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
      field: "approveByDate",
      headerName: "Approve by",
      flex: 3,
      valueFormatter: (params) =>
        params.value && getLocaleDateTimeString(params.value as Date),
    },
    {
      field: "approvers",
      headerName: "Approvers",
      flex: 5,
      valueGetter: (params) =>
        params.value
          .map((approver: string) => approver.toLowerCase())
          .join(", "),
      renderCell: (params) => {
        return (
          <Stack>
            {params.row.approvers.map((approver: string) => {
              return (
                <Typography variant="body2">
                  {approver.toLowerCase()}
                </Typography>
              );
            })}
          </Stack>
        );
      },
    },
    {
      field: "userFiles",
      headerName: "Files",
      flex: 5,
      valueGetter: (params) =>
        params.value.map((userFile: IUserFile) => userFile.name).join(", "),
      renderCell: (params) => {
        return (
          <Stack>
            {params.row.userFiles.map((userFile: IUserFile) => {
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
      field: "comment",
      headerName: "Comment",
      flex: 10,
      renderCell: (params) => {
        return (
          <Stack>
            {params.value &&
              (params.value.split(/\r?\n/) as string[]).map((line) => (
                <Box>{line}</Box>
              ))}
          </Stack>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => {
        return <MenuApprovalRequestActions approvalRequest={params.row} />;
      },
    },
  ];

  return (
    <Box sx={{ display: "flex", pt: 2 }}>
      <Tabs />
      <Box sx={{ width: "100%", overflow: "hidden", pr: 2 }}>
        <DataGrid
          className="DataGridDefault"
          rows={approvalRequests}
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
      <DialogApprovalRequestView />
    </Box>
  );
};

export default observer(GridApprovalRequests);
