import { Check, Close, Loop, QuestionMark } from "@mui/icons-material";
import { Box, Stack, Tooltip } from "@mui/material";
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
import { approvalRequestStore } from "../../stores/approvalRequestStore";
import { commonStore } from "../../stores/commonStore";
import { DATA_GRID_DEFAULT_PAGE_SIZE } from "../../stores/constantsStore";
import {
  getHumanReadableRelativeDate,
  getLocaleDateTimeString,
} from "../../utils/converters";
import ApprovalRequestDeleteDialog from "../dialogs/ApprovalRequestDeleteDialog";
import ApprovalRequestViewDialog from "../dialogs/ApprovalRequestViewDialog";
import { ApproversList } from "../lists/ApproversList";
import { UserFilesList } from "../lists/UserFilesList";
import { ApprovalRequestActionsMenu } from "../menus/ApprovalRequestActionsMenu";
import NoRowsOverlay from "../overlays/NoRowsOverlay";

const SentGrid = () => {
  const { setCurrentTab } = commonStore;
  const { approvalRequests, clearApprovalRequests, loadApprovalRequests } =
    approvalRequestStore;

  useEffect(() => {
    setCurrentTab(Tab.Sent);
    clearApprovalRequests();
    loadApprovalRequests();
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
        return <ApproversList approvers={params.row.approvers} />;
      },
    },
    {
      field: "userFiles",
      headerName: "Files",
      flex: 5,
      valueGetter: (params) =>
        params.value.map((userFile: IUserFile) => userFile.name).join(", "),
      renderCell: (params) => {
        return <UserFilesList userFiles={params.row.userFiles} />;
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
        return <ApprovalRequestActionsMenu approvalRequest={params.row} />;
      },
    },
  ];

  return (
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
      <ApprovalRequestViewDialog />
      <ApprovalRequestDeleteDialog />
    </Box>
  );
};

export default observer(SentGrid);
